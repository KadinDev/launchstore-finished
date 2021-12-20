-- para esse MOD 08 criei novamente esse DB
DROP DATABASE IF EXISTS launchstore;
CREATE DATABASE launchstore;

CREATE TABLE "products" (
  "id" SERIAL PRIMARY KEY,
  "category_id" int NOT NULL, --estava dando erro pq aqui estava como "category_id" int UNIQUE
  "user_id" int, --e aqui estava como "user_id" int UNIQUE
  "name" text NOT NULL,
  "description" text NOT NULL,
  "old_price" int,
  "price" int NOT NULL,
  "quantity" int DEFAULT 0,
  "status" int DEFAULT 1,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

-- o NOT NULL na frente dos nomes, significa que não pode mandar um dado vazio */

CREATE TABLE "categories" (
  "id" SERIAL PRIMARY KEY,
  "name" text NOT NULL
);

INSERT INTO categories(name) VALUES ('comida');
INSERT INTO categories(name) VALUES ('eletrônicos');
INSERT INTO categories(name) VALUES ('automóveis');
INSERT INTO categories(name) VALUES ('roupas');

CREATE TABLE "files" (
  "id" SERIAL PRIMARY KEY,
  "name" text,
  "path" text NOT NULL,
  "product_id" int NOT NULL
);



  --na tabela produto existe uma chave estrangeira na categoria id
  --e ela está referenciando a tabela de categorias no campo id



  --alterando uma tabela, estou adicionando uma chave estrangeira na categoria id,
  --e a referência dela é categories id 

ALTER TABLE "products" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id");
ALTER TABLE "files" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id");



/* USERS */
CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "name" text NOT NULL,

   --email - UNIQUE, ou seja não pode ter dois emails iguais(único)
  "email" text UNIQUE NOT NULL,

  "password" text NOT NULL,
  "cpf_cnpj" text UNIQUE NOT NULL,
  "cep" text,
  "address" text,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

-- foreign key
ALTER TABLE "products" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- create procedure
CREATE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END
$$ LANGUAGE plpgsql;


-- auto updated_at products
CREATE TRIGGER trigger_set_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();  

-- auto updated_at users
CREATE TRIGGER trigger_set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp(); 


-- connect pg simple table, tabela para segurar a sessão
-- criando tabela
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid")



-- token password recovery
--na coluna de users
ALTER TABLE "users" ADD COLUMN reset_token text;
ALTER TABLE "users" ADD COLUMN reset_token_expires text;





-- refazendo a CONSTRAINT, agora com uma ideia de deletamento em cascata
-- cascade efect when delete user and products
-- vai deletar o usuário com seus produtos cadastrados, juntamente com os arquivos dos produtos
ALTER TABLE "products"
DROP CONSTRAINT products_user_id_fkey,
ADD CONSTRAINT products_user_id_fkey
FOREIGN KEY ("user_id")
REFERENCES "users" ("id")
ON DELETE CASCADE;

ALTER TABLE "files"
DROP CONSTRAINT files_product_id_fkey,
ADD CONSTRAINT files_product_id_fkey
FOREIGN KEY ("product_id")
REFERENCES "products" ("id")
ON DELETE CASCADE;

-------------------------------------------
-- aqui foi criado após eu criar async function createProducts no seeds.js
-- ou seja, vai deletar o id de cada item ou pessoa que estiver cadastrado,
-- (ex: id 1, id 2, etc)... e quando for cadastrar novamente ao invés de seguir do 2 em diante
-- (caso o 2 seja o último), ele vai começar do 1 novamente

-- to run seeds
DELETE FROM products;
DELETE FROM users;
DELETE FROM files;

-- restart sequence auto_increment from tables ids
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE files_id_seq RESTART WITH 1;



-- TABELA DE PEDIDOS
CREATE TABLE "orders" (
  "id" SERIAL PRIMARY KEY,
  "seller_id" int NOT NULL,
  "buyer_id" int NOT NULL,
  "product_id" int NOT NULL,
  "price" int NOT NULL,
  "quantity" int DEFAULT 0,
  "total" int NOT NULL,
  "status" text NOT NULL,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

ALTER TABLE "orders" ADD FOREIGN KEY ("seller_id") REFERENCES "users" ("id");
ALTER TABLE "orders" ADD FOREIGN KEY ("buyer_id") REFERENCES "users" ("id");
ALTER TABLE "orders" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id");

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();





-- Essa foi feita já no final do projeto, a parte de excluir o produto do sistema

-- SOFT DELETE
-- Criar coluna na tabela produtos chamada "deleted_at"
ALTER TABLE products ADD COLUMN "deleted_at" timestamp

-- Criar uma regra que vai rodar todas as vezes que solicitarmos o DELETE
-- RULE significa REGRA
CREATE OR REPLACE RULE delete_product AS
ON DELETE TO products DO INSTEAD
UPDATE products
SET deleted_at = now()
WHERE products.id = old.id;


-- Criar uma VIEW onde vamos puxar somente os dados que estão ativos
CREATE VIEW products_without_deleted AS
SELECT * FROM products WHERE deleted_at IS NULL;

-- a ideia desse "deleted_at" é apenas desativar o produto, e não deletar completamente do sistema

-- Renomear a nossa VIEW e a nossa TABLE
ALTER TABLE products RENAME TO products_with_deleted;
ALTER VIEW products_without_deleted RENAME TO products;

