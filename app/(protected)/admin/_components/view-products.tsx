"use client"
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ViewProductsDialog = ({ products }: { products: any[] }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View
        </Button>
      </DialogTrigger>
      <DialogContent>
        <h3 className="text-lg font-medium">Products</h3>
        {products.length === 0 ? (
          <p>No products available</p>
        ) : (
          <ul className="list-disc list-inside">
            {products.map((product, index) => (
              <li key={index}>{product.name}</li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewProductsDialog;
