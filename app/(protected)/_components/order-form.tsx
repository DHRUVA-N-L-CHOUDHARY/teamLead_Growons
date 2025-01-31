"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { OrderSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import React, { useState } from "react";
import { toast } from "sonner";
import { formatPrice } from "@/components/shared/formatPrice";
import { addOrder } from "@/actions/orders";
import { useRouter } from "next/navigation";

type FormValues = z.infer<typeof OrderSchema>;

type OrderProps = {
  id: string;
  products: any;
  role: "PRO" | "BLOCKED" | "USER" | "ADMIN" | "LEADER" | undefined;

  children: React.ReactNode;
};

const OrderForm = ({ id, products, children }: OrderProps) => {
  const [error, setError] = useState<string | undefined>("");
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(OrderSchema),
    mode: "onBlur",
    defaultValues: {
      id: id,
      products: [
        {
          name: "",
          quantity: 0,
        },
      ],
      price: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "products",
    control: form.control,
  });

  const onSubmit = (values: FormValues) => {
    setError("");
    if (values.products.length === 0) {
      toast.error("Order cannot be empty");
      return;
    }
    startTransition(() => {
      values.price = calculateTotalAmount();
      addOrder(values).then((data) => {
        if (data?.success) {
          toast.success(data.success);
          form.reset();
          router.refresh();
        }

        if (data?.error) {
          setError(data.error);
          toast.error(data.error, {
            action: {
              label: "close",
              onClick: () => console.log("Undo"),
            },
          });
        }
      });
    });
  };

  const calculateTotalAmount = () => {
    return form.getValues().products.reduce((total, product) => {
      const productPrice =
        products.find((p: any) => p.name === product.name)?.price || 0;
      return total + product.quantity * productPrice;
    }, 0);
  };

  return (
    <div className="flex flex-col lg:flex-row md:justify-between gap-4  md:gap-x-10">
      <div className="md:overflow-auto md:max-h-[90vh] w-full md:w-[50%] p-2">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-[100%]"
          >
            {fields.map((item, index) => (
              <div key={item.id}>
                <FormField
                  control={form.control}
                  name={`products.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        disabled={isPending}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                        </FormControl>
                        <FormMessage />
                        <SelectContent>
                          {products.map((product: any) => {
                            return (
                              <SelectItem
                                value={product.name}
                                key={product.id}
                                className="capitalize"
                              >
                                {product.name}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`products.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  disabled={isPending}
                  onClick={() => remove(index)}
                  className="mt-2 mb-2"
                  variant={"ghost"}
                >
                  Remove Product
                </Button>
              </div>
            ))}
            <div>
              <FormField
                control={form.control}
                name="products"
                render={() => (
                  <Button type="button" disabled={isPending} className={`mb-2`}>
                    <div className="flex items-center gap-x-3 mt-2 mb-2">
                      <label
                        htmlFor="Products"
                        className={`text-sm text-[7E8DA0] cursor-pointer focus:outline-none focus:underline`}
                        tabIndex={0}
                        onClick={() => {
                          if (fields.length === 0) {
                            append({
                              name: "",
                              quantity: 0,
                            });
                          } else {
                            const lastProduct =
                              form.getValues().products[fields.length - 1];

                            if (lastProduct && lastProduct.name.trim() !== "") {
                              append({
                                name: "",
                                quantity: 0,
                              });
                            } else {
                              toast.error(
                                "Please fill in the previous product before adding a new one."
                              );
                            }
                          }
                        }}
                      >
                        Add Product
                      </label>
                    </div>
                  </Button>
                )}
              />
            </div>
            <Button disabled={isPending} type="submit" className="mt-0 w-full">
              Request Order
            </Button>
          </form>
        </Form>
      </div>
      <div className="flex-1 ml-2">
        <span>Total amount:</span>
        <p className="font-bold text-2xl">
          {formatPrice(calculateTotalAmount())}
        </p>
        <div className="mt-2 md:overflow-auto md:max-h-[80vh] w-full p-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
