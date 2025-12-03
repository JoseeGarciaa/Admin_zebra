-- Multitenant helper functions for Admin Platform

CREATE OR REPLACE FUNCTION admin_platform.crear_tenant(
    p_nombre text,
    p_email_contacto text,
    p_password_hash text,
    p_nit text DEFAULT NULL,
    p_telefono_contacto text DEFAULT NULL,
    p_direccion text DEFAULT NULL,
    p_estado boolean DEFAULT true
)
RETURNS TABLE (
    id integer,
    nombre text,
    nit text,
    email_contacto text,
    telefono_contacto text,
    direccion text,
    estado boolean,
    ultimo_ingreso timestamp,
    fecha_creacion timestamp,
    esquema text
)
LANGUAGE plpgsql
AS $function$
DECLARE
    base_schema constant text := 'tenant_base';
    nuevo_esquema text;
    base_slug text;
    suffix int := 0;
    tabla text;
    schema_prefix text;
    seq_rec record;
    seq_sql text;
    fn_record record;
    fn_sql text;
    trigger_record record;
    trigger_sql text;
    default_rec record;
    new_default text;
    seq_name text;
    fk_drop record;
    fk_record record;
    tenant_row admin_platform.tenants%ROWTYPE;
    admin_nombre text;
    admin_username text;
BEGIN
    IF p_nombre IS NULL OR btrim(p_nombre) = '' THEN
        RAISE EXCEPTION 'El nombre del tenant es obligatorio.';
    END IF;

    IF p_email_contacto IS NULL OR btrim(p_email_contacto) = '' THEN
        RAISE EXCEPTION 'El correo de contacto es obligatorio.';
    END IF;

    IF p_password_hash IS NULL OR btrim(p_password_hash) = '' THEN
        RAISE EXCEPTION 'La contraseña hash es obligatoria.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
          FROM information_schema.schemata
         WHERE schema_name = base_schema
    ) THEN
        RAISE EXCEPTION 'El esquema base "%" no existe.', base_schema;
    END IF;

    base_slug := regexp_replace(lower(coalesce(p_nombre, 'tenant')), '[^a-z0-9]+', '_', 'g');

    IF base_slug IS NULL OR base_slug = '' THEN
        base_slug := 'tenant';
    END IF;

    LOOP
        nuevo_esquema := format(
            'tenant_%s%s',
            base_slug,
            CASE WHEN suffix = 0 THEN '' ELSE '_' || suffix::text END
        );

        EXIT WHEN NOT EXISTS (
            SELECT 1
              FROM information_schema.schemata
             WHERE schema_name = nuevo_esquema
        )
        AND NOT EXISTS (
            SELECT 1
              FROM admin_platform.tenants
             WHERE esquema = nuevo_esquema
        );

        suffix := suffix + 1;
    END LOOP;

    EXECUTE format('CREATE SCHEMA %I AUTHORIZATION "admin";', nuevo_esquema);

    schema_prefix := quote_ident(nuevo_esquema) || '.';

    FOR tabla IN
        SELECT table_name
          FROM information_schema.tables
         WHERE table_schema = base_schema
           AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format(
            'CREATE TABLE %I.%I (LIKE %I.%I INCLUDING ALL);',
            nuevo_esquema,
            tabla,
            base_schema,
            tabla
        );
    END LOOP;

    FOR seq_rec IN
        SELECT schemaname,
               sequencename,
               data_type,
               start_value,
               increment_by,
               min_value,
               max_value,
               cache_size,
               cycle
          FROM pg_sequences
         WHERE schemaname = base_schema
    LOOP
        PERFORM 1
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = nuevo_esquema
           AND c.relkind = 'S'
           AND c.relname = seq_rec.sequencename;

        IF FOUND THEN
            CONTINUE;
        END IF;

        seq_sql := format(
            'CREATE SEQUENCE %I.%I AS %s INCREMENT BY %s START WITH %s CACHE %s ',
            nuevo_esquema,
            seq_rec.sequencename,
            seq_rec.data_type,
            seq_rec.increment_by,
            seq_rec.start_value,
            seq_rec.cache_size
        );

        IF seq_rec.min_value IS NULL THEN
            seq_sql := seq_sql || 'NO MINVALUE ';
        ELSE
            seq_sql := seq_sql || format('MINVALUE %s ', seq_rec.min_value);
        END IF;

        IF seq_rec.max_value IS NULL THEN
            seq_sql := seq_sql || 'NO MAXVALUE ';
        ELSE
            seq_sql := seq_sql || format('MAXVALUE %s ', seq_rec.max_value);
        END IF;

        IF seq_rec.cycle THEN
            seq_sql := seq_sql || 'CYCLE;';
        ELSE
            seq_sql := seq_sql || 'NO CYCLE;';
        END IF;

        EXECUTE seq_sql;
    END LOOP;

    FOR fn_record IN
        SELECT p.oid,
               format('%I.%I', n.nspname, p.proname) AS qualified_name,
               pg_get_functiondef(p.oid)             AS definition
          FROM pg_proc p
          JOIN pg_namespace n ON n.oid = p.pronamespace
         WHERE n.nspname = base_schema
           AND p.prokind = 'f'
    LOOP
        fn_sql := replace(fn_record.definition, base_schema || '.', schema_prefix);
        fn_sql := regexp_replace(
            fn_sql,
            'CREATE\s+OR\s+REPLACE\s+FUNCTION\s+' || base_schema || '\.',
            'CREATE OR REPLACE FUNCTION ' || quote_ident(nuevo_esquema) || '.',
            1,
            1,
            'i'
        );

        BEGIN
            EXECUTE fn_sql;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'No se pudo copiar función %: %', fn_record.qualified_name, SQLERRM;
        END;
    END LOOP;

    FOR trigger_record IN
        SELECT tg.oid,
               tg.tgname,
               rel.relname AS table_name,
               pg_get_triggerdef(tg.oid, true) AS definition
          FROM pg_trigger tg
          JOIN pg_class rel ON rel.oid = tg.tgrelid
          JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
         WHERE nsp.nspname = base_schema
           AND tg.tgisinternal = false
    LOOP
        trigger_sql := replace(trigger_record.definition, base_schema || '.', schema_prefix) || ';';

        BEGIN
            EXECUTE trigger_sql;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'No se pudo crear trigger % en %.%: %',
                          trigger_record.tgname, nuevo_esquema, trigger_record.table_name, SQLERRM;
        END;
    END LOOP;

    FOR default_rec IN
        SELECT table_name, column_name, column_default
          FROM information_schema.columns
         WHERE table_schema = nuevo_esquema
           AND column_default ILIKE base_schema || '.%'
    LOOP
        new_default := replace(default_rec.column_default, base_schema || '.', schema_prefix);

        BEGIN
            EXECUTE format(
                'ALTER TABLE %I.%I ALTER COLUMN %I SET DEFAULT %s;',
                nuevo_esquema,
                default_rec.table_name,
                default_rec.column_name,
                new_default
            );
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'No se pudo ajustar DEFAULT en %.%.%: %',
                          nuevo_esquema, default_rec.table_name, default_rec.column_name, SQLERRM;
        END;

        BEGIN
            SELECT pg_get_serial_sequence(format('%I.%I', nuevo_esquema, default_rec.table_name), default_rec.column_name)
              INTO seq_name;

            IF seq_name IS NOT NULL THEN
                EXECUTE format(
                    'ALTER SEQUENCE %s OWNED BY %I.%I.%I;',
                    seq_name,
                    nuevo_esquema,
                    default_rec.table_name,
                    default_rec.column_name
                );
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'No se pudo asignar OWNED BY para %I.%I.%I: %',
                          nuevo_esquema, default_rec.table_name, default_rec.column_name, SQLERRM;
        END;
    END LOOP;

    FOR fk_drop IN
        SELECT con.conname       AS constraint_name,
               rel.relname       AS table_name
          FROM pg_constraint con
          JOIN pg_class      rel ON rel.oid = con.conrelid
          JOIN pg_namespace  nsp ON nsp.oid = rel.relnamespace
         WHERE nsp.nspname = nuevo_esquema
           AND con.contype = 'f'
    LOOP
        EXECUTE format(
            'ALTER TABLE %I.%I DROP CONSTRAINT %I;',
            nuevo_esquema,
            fk_drop.table_name,
            fk_drop.constraint_name
        );
    END LOOP;

    FOR fk_record IN
        SELECT
            con.conname AS constraint_name,
            rel.relname AS table_name,
            string_agg(att.attname, ', ' ORDER BY att.attnum) AS local_columns,
            confrel.relname AS foreign_table_name,
            CASE con.confdeltype
                WHEN 'r' THEN 'RESTRICT'
                WHEN 'c' THEN 'CASCADE'
                WHEN 'n' THEN 'SET NULL'
                WHEN 'd' THEN 'SET DEFAULT'
                ELSE 'NO ACTION'
            END AS on_delete_action,
            CASE con.confupdtype
                WHEN 'r' THEN 'RESTRICT'
                WHEN 'c' THEN 'CASCADE'
                WHEN 'n' THEN 'SET NULL'
                WHEN 'd' THEN 'SET DEFAULT'
                ELSE 'NO ACTION'
            END AS on_update_action,
            string_agg(confatt.attname, ', ' ORDER BY confatt.attnum) AS foreign_columns
        FROM pg_constraint con
        JOIN pg_class      rel     ON rel.oid = con.conrelid
        JOIN pg_namespace  nsp     ON nsp.oid = rel.relnamespace
        JOIN pg_class      confrel ON confrel.oid = con.confrelid
        JOIN pg_attribute  att     ON att.attrelid = con.conrelid  AND att.attnum = ANY(con.conkey)
        JOIN pg_attribute  confatt ON confatt.attrelid = con.confrelid AND confatt.attnum = ANY(con.confkey)
        WHERE nsp.nspname = base_schema
          AND con.contype = 'f'
        GROUP BY con.conname, rel.relname, confrel.relname, con.confdeltype, con.confupdtype
    LOOP
        BEGIN
            EXECUTE format(
                'ALTER TABLE %I.%I ADD CONSTRAINT %I
                 FOREIGN KEY (%s)
                 REFERENCES %I.%I (%s)
                 ON DELETE %s ON UPDATE %s;',
                nuevo_esquema,
                fk_record.table_name,
                fk_record.constraint_name,
                fk_record.local_columns,
                nuevo_esquema,
                fk_record.foreign_table_name,
                fk_record.foreign_columns,
                fk_record.on_delete_action,
                fk_record.on_update_action
            );
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error al recrear clave foránea % en tabla %.%: %',
                          fk_record.constraint_name, nuevo_esquema, fk_record.table_name, SQLERRM;
        END;
    END LOOP;

    admin_nombre := coalesce(nullif(btrim(p_nombre), ''), 'Administrador');
    admin_username := lower(regexp_replace(split_part(p_email_contacto, '@', 1), '[^a-z0-9]+', '', 'g'));

    IF admin_username IS NULL OR admin_username = '' THEN
        admin_username := 'admin_' || substr(md5(random()::text), 1, 6);
    END IF;

    INSERT INTO admin_platform.tenants
        (nombre, nit, email_contacto, telefono_contacto, direccion, estado, contraseña, esquema)
    VALUES
        (p_nombre, p_nit, p_email_contacto, p_telefono_contacto, p_direccion, coalesce(p_estado, true), p_password_hash, nuevo_esquema)
    RETURNING * INTO tenant_row;

    EXECUTE format(
        'INSERT INTO %I.admin_users (nombre, email, username, password_hash, roles, activo)
         VALUES ($1, $2, $3, $4, $5, true);',
        nuevo_esquema
    )
    USING admin_nombre, p_email_contacto, admin_username, p_password_hash, ARRAY['admin', 'seguridad']::text[];

    RETURN QUERY SELECT
        tenant_row.id,
        tenant_row.nombre,
        tenant_row.nit,
        tenant_row.email_contacto,
        tenant_row.telefono_contacto,
        tenant_row.direccion,
        tenant_row.estado,
        tenant_row.ultimo_ingreso,
        tenant_row.fecha_creacion,
        tenant_row.esquema;
EXCEPTION WHEN OTHERS THEN
    BEGIN
        IF nuevo_esquema IS NOT NULL THEN
            EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE;', nuevo_esquema);
        END IF;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    IF tenant_row.id IS NOT NULL THEN
        BEGIN
            DELETE FROM admin_platform.tenants WHERE id = tenant_row.id;
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END IF;

    RAISE;
END;
$function$;

CREATE OR REPLACE FUNCTION admin_platform.actualizar_tenant(
    esquema_actual text,
    esquema_nuevo text,
    nuevo_nombre text,
    nuevo_correo text,
    nuevo_telefono text,
    nueva_contraseña_hash text,
    nuevo_estado boolean DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
    esquema_destino text;
    tenant_row admin_platform.tenants%ROWTYPE;
    admin_id integer;
    admin_username text;
BEGIN
    IF esquema_actual IS NULL OR btrim(esquema_actual) = '' THEN
        RAISE EXCEPTION 'El esquema actual es obligatorio.';
    END IF;

    SELECT * INTO tenant_row
      FROM admin_platform.tenants
     WHERE esquema = esquema_actual
     FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró un tenant con esquema %.', esquema_actual;
    END IF;

    esquema_destino := esquema_actual;

    IF esquema_nuevo IS NOT NULL AND btrim(esquema_nuevo) <> '' AND esquema_nuevo <> esquema_actual THEN
        IF EXISTS (
            SELECT 1
              FROM information_schema.schemata
             WHERE schema_name = esquema_nuevo
        ) THEN
            RAISE EXCEPTION 'Ya existe un esquema con el nombre %.', esquema_nuevo;
        END IF;

        EXECUTE format('ALTER SCHEMA %I RENAME TO %I;', esquema_actual, esquema_nuevo);
        esquema_destino := esquema_nuevo;
    END IF;

    admin_username := lower(regexp_replace(split_part(coalesce(nuevo_correo, tenant_row.email_contacto), '@', 1), '[^a-z0-9]+', '', 'g'));

    IF admin_username IS NULL OR admin_username = '' THEN
        admin_username := 'admin_' || substr(md5(random()::text), 1, 6);
    END IF;

    EXECUTE format(
        'SELECT id FROM %I.admin_users WHERE ''admin'' = ANY(roles) ORDER BY id LIMIT 1;',
        esquema_destino
    )
    INTO admin_id;

    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró un usuario administrador en el esquema %.', esquema_destino;
    END IF;

    EXECUTE format(
        'UPDATE %I.admin_users
           SET nombre = $1,
               email = $2,
               username = $3,
               password_hash = COALESCE($4, password_hash),
               roles = ARRAY[''admin'',''seguridad'']::text[],
               activo = true,
               intentos_fallidos = 0,
               bloqueado_hasta = NULL,
               updated_at = NOW()
         WHERE id = $5;',
        esquema_destino
    )
    USING coalesce(nuevo_nombre, tenant_row.nombre),
          coalesce(nuevo_correo, tenant_row.email_contacto),
          admin_username,
          nueva_contraseña_hash,
          admin_id;

    UPDATE admin_platform.tenants
       SET nombre = COALESCE(nuevo_nombre, nombre),
           email_contacto = COALESCE(nuevo_correo, email_contacto),
           telefono_contacto = COALESCE(nuevo_telefono, telefono_contacto),
           estado = COALESCE(nuevo_estado, estado),
           contraseña = COALESCE(nueva_contraseña_hash, contraseña),
           esquema = esquema_destino
     WHERE id = tenant_row.id;
END;
$function$;

CREATE OR REPLACE FUNCTION admin_platform.eliminar_tenant(esquema_a_eliminar text)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
    tenant_id integer;
BEGIN
    IF esquema_a_eliminar IS NULL OR btrim(esquema_a_eliminar) = '' THEN
        RAISE EXCEPTION 'El nombre del esquema no puede ser vacío.';
    END IF;

    IF lower(esquema_a_eliminar) IN ('tenant_base', 'public', 'admin_platform') THEN
        RAISE EXCEPTION 'El esquema "%" es protegido y no puede eliminarse.', esquema_a_eliminar;
    END IF;

    IF NOT EXISTS (
        SELECT 1
          FROM information_schema.schemata
         WHERE schema_name = esquema_a_eliminar
    ) THEN
        RAISE EXCEPTION 'El esquema "%" no existe.', esquema_a_eliminar;
    END IF;

    SELECT id
      INTO tenant_id
      FROM admin_platform.tenants
     WHERE esquema = esquema_a_eliminar
     LIMIT 1;

    EXECUTE format('DROP SCHEMA %I CASCADE;', esquema_a_eliminar);

    IF tenant_id IS NOT NULL THEN
        DELETE FROM admin_platform.tenants WHERE id = tenant_id;
    END IF;
END;
$function$;
