import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCategories } from "../api/categories.ts";
import {
  createProduct,
  updateProduct,
  useProductById,
  type ProductDetail,
} from "../api/products.ts";
import {
  applyServerFieldErrors,
  centsToRufiyaa,
  productFormSchema,
  toProductWriteBody,
  type ProductFormValues,
} from "../productForm.ts";

const inputClassName =
  "w-full rounded border border-border bg-background px-3 py-2 text-sm";

function formDefaults(product: ProductDetail | undefined): ProductFormValues {
  if (product === undefined) {
    return {
      name: "",
      description: "",
      price: "",
      stock: "0",
      imageUrl: "",
      categoryId: "",
    };
  }

  return {
    name: product.name,
    description: product.description,
    price: centsToRufiyaa(product.priceCents),
    stock: String(product.stock),
    imageUrl: product.imageUrl ?? "",
    categoryId: product.category.id,
  };
}

function ProductForm({
  product,
  onClose,
}: {
  product: ProductDetail | undefined;
  onClose: () => void;
}) {
  const categories = useCategories();
  const queryClient = useQueryClient();
  const [formMessage, setFormMessage] = useState<string | undefined>();
  const priceId = useId();
  const nameId = useId();
  const descriptionId = useId();
  const stockId = useId();
  const imageId = useId();
  const categoryId = useId();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: formDefaults(product),
  });

  const mode = product === undefined ? "create" : "edit";
  const save = useMutation({
    mutationFn: (values: ProductFormValues) => {
      const body = toProductWriteBody(values, mode);
      if (product === undefined) {
        return createProduct(body);
      }
      return updateProduct(product.id, body);
    },
  });

  async function onSubmit(values: ProductFormValues): Promise<void> {
    setFormMessage(undefined);
    try {
      await save.mutateAsync(values);
    } catch (error) {
      setFormMessage(applyServerFieldErrors(error, setError));
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["products"] });
    onClose();
  }

  return (
    <form className="flex min-h-0 flex-1 flex-col" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-6">
        <div>
          <label
            htmlFor={nameId}
            className="text-xs font-medium tracking-wide text-muted uppercase"
          >
            Name
          </label>
          <input
            id={nameId}
            autoFocus
            className={`${inputClassName} mt-2`}
            aria-invalid={errors.name !== undefined}
            {...register("name")}
          />
          {errors.name !== undefined ? (
            <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor={descriptionId}
            className="text-xs font-medium tracking-wide text-muted uppercase"
          >
            Description
          </label>
          <textarea
            id={descriptionId}
            rows={4}
            className={`${inputClassName} mt-2`}
            aria-invalid={errors.description !== undefined}
            {...register("description")}
          />
          {errors.description !== undefined ? (
            <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor={priceId}
            className="text-xs font-medium tracking-wide text-muted uppercase"
          >
            Price (rufiyaa)
          </label>
          <input
            id={priceId}
            inputMode="decimal"
            placeholder="12.50"
            className={`${inputClassName} mt-2`}
            aria-invalid={errors.price !== undefined}
            {...register("price")}
          />
          {errors.price !== undefined ? (
            <p className="mt-1 text-sm text-destructive">{errors.price.message}</p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor={stockId}
            className="text-xs font-medium tracking-wide text-muted uppercase"
          >
            Stock
          </label>
          <input
            id={stockId}
            inputMode="numeric"
            className={`${inputClassName} mt-2`}
            aria-invalid={errors.stock !== undefined}
            {...register("stock")}
          />
          {errors.stock !== undefined ? (
            <p className="mt-1 text-sm text-destructive">{errors.stock.message}</p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor={imageId}
            className="text-xs font-medium tracking-wide text-muted uppercase"
          >
            Image URL
          </label>
          <input
            id={imageId}
            inputMode="url"
            placeholder="https://"
            className={`${inputClassName} mt-2`}
            aria-invalid={errors.imageUrl !== undefined}
            {...register("imageUrl")}
          />
          {errors.imageUrl !== undefined ? (
            <p className="mt-1 text-sm text-destructive">{errors.imageUrl.message}</p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor={categoryId}
            className="text-xs font-medium tracking-wide text-muted uppercase"
          >
            Category
          </label>
          <select
            id={categoryId}
            className={`${inputClassName} mt-2`}
            aria-invalid={errors.categoryId !== undefined}
            {...register("categoryId")}
          >
            <option value="">Choose a category</option>
            {categories.data?.data.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId !== undefined ? (
            <p className="mt-1 text-sm text-destructive">{errors.categoryId.message}</p>
          ) : null}
          {categories.isError ? (
            <p className="mt-1 text-sm text-destructive">Could not load categories.</p>
          ) : null}
        </div>
        {formMessage !== undefined ? (
          <p className="text-sm text-destructive" role="alert">
            {formMessage}
          </p>
        ) : null}
      </div>
      <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-border px-4 py-2 text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={save.isPending}
          className="rounded bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-40"
        >
          {save.isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

export function ProductFormDrawer({
  productId,
  onClose,
}: {
  productId: string | undefined;
  onClose: () => void;
}) {
  const titleId = useId();
  const isEdit = productId !== undefined;
  const categories = useCategories();
  const productQuery = useProductById(productId);
  const product = productQuery.data?.data;
  const categoriesReady = categories.data !== undefined;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  let body = <p className="px-6 py-6 text-sm text-muted">Loading…</p>;

  if (isEdit && productQuery.isError) {
    const message =
      productQuery.error instanceof Error
        ? productQuery.error.message
        : "Could not load this product.";
    body = (
      <p className="px-6 py-6 text-sm text-destructive" role="alert">
        {message}
      </p>
    );
  } else if (categories.isError) {
    body = (
      <p className="px-6 py-6 text-sm text-destructive" role="alert">
        Could not load categories.
      </p>
    );
  } else if ((!isEdit || product !== undefined) && categoriesReady) {
    body = <ProductForm key={product?.id ?? "create"} product={product} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 z-20">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border bg-background"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 id={titleId} className="text-3xl">
            {isEdit ? "Edit product" : "New product"}
          </h2>
          <button type="button" onClick={onClose} className="text-sm text-muted">
            Close
          </button>
        </div>
        {body}
      </aside>
    </div>
  );
}
