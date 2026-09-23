"use client";

import { IconTrash } from "@tabler/icons-react";
import { useFormStatus } from "react-dom";
import { deleteTransactionAction } from "@/app/transaksi/actions";
import { Button } from "@/components/ui/button";

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="destructive"
      size="icon-sm"
      disabled={pending}
      aria-label="Hapus transaksi"
      title="Hapus transaksi"
    >
      <IconTrash size={14} />
    </Button>
  );
}

export function DeleteTransactionButton({
  id,
  redirectTo = "/transaksi",
}: {
  id: string;
  redirectTo?: string;
}) {
  return (
    <form
      action={deleteTransactionAction}
      onSubmit={(event) => {
        if (!window.confirm("Hapus transaksi ini?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <DeleteButton />
    </form>
  );
}
