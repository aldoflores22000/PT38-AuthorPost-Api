import { describe, expect, test } from "vitest";
import {
  validarAuthor,
  validarComment,
  validarEmail,
  validarIdParam,
  validarPost,
  validarTextoRequerido,
} from "../src/utils/validators.js";

describe("validarTextoRequerido", () => {
  test("acepta un texto válido", () => {
    expect(validarTextoRequerido("Hola", "title")).toBeNull();
  });

  test.each([undefined, null])("rechaza %s", (value) => {
    expect(validarTextoRequerido(value, "title")).toContain("requerido");
  });

  test("rechaza un texto con solo espacios", () => {
    expect(validarTextoRequerido("   ", "title")).toContain("vacío");
  });

  test("rechaza un valor que no es texto", () => {
    expect(validarTextoRequerido(123, "title")).toContain("texto");
  });

  test("respeta el largo máximo", () => {
    expect(validarTextoRequerido("abcd", "title", 3)).toContain("3");
    expect(validarTextoRequerido("abc", "title", 3)).toBeNull();
  });
});

describe("validarEmail", () => {
  test("acepta un email válido", () => {
    expect(validarEmail("test@example.com")).toBeNull();
  });

  test.each(["", null, undefined])("rechaza el valor vacío %s", (email) => {
    expect(validarEmail(email)).toContain("requerido");
  });

  test.each(["testexample.com", "test@", "@example.com", "a b@example.com"])(
    "rechaza el formato de %s",
    (email) => {
      expect(validarEmail(email)).toContain("inválido");
    },
  );

  test("rechaza un array aunque su contenido parezca un email", () => {
    expect(validarEmail(["test@example.com"])).toContain("texto");
  });
});

describe("validarIdParam", () => {
  test.each(["1", "42", "2147483647"])("acepta %s", (id) => {
    expect(validarIdParam(id)).toBeNull();
  });

  test.each(["0", "-1", "abc", "1.5", "2147483648", ""])("rechaza '%s'", (id) => {
    expect(validarIdParam(id)).toContain("entero positivo");
  });
});

describe("validarAuthor", () => {
  test("acepta un autor válido sin bio", () => {
    expect(validarAuthor({ name: "Ana", email: "ana@example.com" })).toBeNull();
  });

  test("rechaza un cuerpo ausente", () => {
    expect(validarAuthor(undefined)).toContain("name");
  });
});

describe("validarComment", () => {
  test("acepta un comentario válido", () => {
    expect(validarComment({ post_id: 1, author_id: 1, content: "Hola" })).toBeNull();
  });

  test("rechaza un cuerpo ausente", () => {
    expect(validarComment(undefined)).toContain("post_id");
  });

  test.each([0, -1, 1.5, "1", 2147483648])("rechaza post_id %s", (post_id) => {
    expect(validarComment({ post_id, author_id: 1, content: "c" })).toContain("post_id");
  });

  test("rechaza content vacío", () => {
    expect(validarComment({ post_id: 1, author_id: 1, content: " " })).toContain("content");
  });
});

describe("validarPost", () => {
  test("acepta un post válido sin published", () => {
    expect(validarPost({ title: "t", content: "c", author_id: 1 })).toBeNull();
  });

  test("rechaza un cuerpo ausente", () => {
    expect(validarPost(undefined)).toContain("title");
  });

  test.each([0, -1, 1.5, "1", 2147483648])("rechaza author_id %s", (author_id) => {
    expect(validarPost({ title: "t", content: "c", author_id })).toContain("author_id");
  });
});
