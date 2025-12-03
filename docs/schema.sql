-- Schema and tables required by the application

CREATE SCHEMA IF NOT EXISTS admin_platform AUTHORIZATION "admin";

CREATE SEQUENCE IF NOT EXISTS admin_platform.admin_users_id_seq
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    START 1
    CACHE 1
    NO CYCLE;

CREATE SEQUENCE IF NOT EXISTS admin_platform.tenants_id_seq
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    START 1
    CACHE 1
    NO CYCLE;

CREATE TABLE IF NOT EXISTS admin_platform.admin_users (
    id serial4 PRIMARY KEY,
    nombre text NOT NULL,
    correo text NOT NULL UNIQUE,
    telefono text NULL,
    contraseña text NOT NULL,
    rol text NOT NULL CHECK (rol = ANY (ARRAY['admin', 'soporte'])),
    activo bool DEFAULT true,
    ultimo_ingreso timestamp NULL,
    fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_platform.tenants (
    id serial4 PRIMARY KEY,
    nombre text NOT NULL UNIQUE,
    nit text NULL UNIQUE,
    email_contacto text NOT NULL UNIQUE,
    telefono_contacto text NULL,
    direccion text NULL,
    estado bool DEFAULT true,
    fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP,
    contraseña text NOT NULL,
    ultimo_ingreso timestamp NULL,
    esquema text NULL UNIQUE
);

GRANT ALL ON SCHEMA admin_platform TO "admin";
GRANT UPDATE, DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE ON ALL TABLES IN SCHEMA admin_platform TO "admin";
GRANT ALL ON ALL SEQUENCES IN SCHEMA admin_platform TO "admin";
