import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transferSchema, depositSchema, withdrawalSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";

interface TransferFormProps {
  type: string;
}

export default function Transfer() {
  const params = useParams();
  const [, navigate] = useLocation();
  const transactionType = params.type || "transfer";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch accounts
  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["/api/accounts"],
  });

  // Function to determine the form schema based on transaction type
  const getFormSchema = () => {
    switch (transactionType) {
      case "transfer":
        return transferSchema;
      case "deposit":
        return depositSchema;
      case "withdrawal":
        return withdrawalSchema;
      default:
        return transferSchema;
    }
  };

  // Initialize form with the appropriate schema
  const form = useForm({
    resolver: zodResolver(getFormSchema()),
    defaultValues: {
      fromAccountId: undefined,
      toAccountId: undefined,
      accountId: undefined,
      amount: "",
      description: "",
    },
  });

  // Reset form when transaction type changes
  useEffect(() => {
    form.reset();
  }, [transactionType, form]);

  // Transaction mutation
  const mutation = useMutation({
    mutationFn: async (formData: any) => {
      const url = `/api/transactions/${transactionType}`;
      return apiRequest("POST", url, formData);
    },
    onSuccess: async () => {
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      
      toast({
        title: "Transaction Successful",
        description: `Your ${transactionType} has been processed successfully.`,
      });
      
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: error.message || "An error occurred during the transaction",
      });
    },
  });

  // Format currency helper
  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(typeof amount === "string" ? parseFloat(amount) : amount);
  };

  // Submit handler
  const onSubmit = (data: any) => {
    if (transactionType === "transfer") {
      mutation.mutate({
        fromAccountId: parseInt(data.fromAccountId),
        toAccountId: parseInt(data.toAccountId),
        amount: data.amount,
        description: data.description,
      });
    } else if (transactionType === "deposit" || transactionType === "withdrawal") {
      mutation.mutate({
        accountId: parseInt(data.accountId),
        amount: data.amount,
        description: data.description,
      });
    }
  };

  // Helper functions for UI text
  const getTransactionTypeTitle = () => {
    switch (transactionType) {
      case "transfer":
        return "Transfer Money";
      case "deposit":
        return "Make a Deposit";
      case "withdrawal":
        return "Make a Withdrawal";
      default:
        return "Transaction";
    }
  };

  const getTransactionTypeDescription = () => {
    switch (transactionType) {
      case "transfer":
        return "Move money between your accounts.";
      case "deposit":
        return "Add funds to your account.";
      case "withdrawal":
        return "Withdraw funds from your account.";
      default:
        return "";
    }
  };

  const getTransactionButtonText = () => {
    switch (transactionType) {
      case "transfer":
        return "Transfer Funds";
      case "deposit":
        return "Complete Deposit";
      case "withdrawal":
        return "Complete Withdrawal";
      default:
        return "Submit";
    }
  };

  if (accountsLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="animate-pulse">
          <CardContent className="p-6 h-96"></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-neutral-900">
            {getTransactionTypeTitle()}
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            {getTransactionTypeDescription()}
          </p>
        </div>

        <div className="border-t border-neutral-200 px-4 py-5 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* From Account Select (only for transfer and withdrawal) */}
              {["transfer", "withdrawal"].includes(transactionType) && (
                <FormField
                  control={form.control}
                  name={transactionType === "transfer" ? "fromAccountId" : "accountId"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Account</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accounts.map((account: any) => (
                            <SelectItem key={account.id} value={account.id.toString()}>
                              {account.type === "checking"
                                ? "Checking Account"
                                : account.type === "savings"
                                ? "Savings Account"
                                : "Credit Card"}{" "}
                              - {formatCurrency(account.balance)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* To Account Select (only for transfer and deposit) */}
              {["transfer", "deposit"].includes(transactionType) && (
                <FormField
                  control={form.control}
                  name={transactionType === "transfer" ? "toAccountId" : "accountId"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Account</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value?.toString()}
                        disabled={
                          transactionType === "transfer" &&
                          !form.getValues("fromAccountId")
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accounts
                            .filter((account: any) => {
                              // In transfer mode, filter out the selected "from" account
                              if (transactionType === "transfer") {
                                const fromId = form.getValues("fromAccountId");
                                return fromId && account.id !== parseInt(fromId);
                              }
                              return true;
                            })
                            .map((account: any) => (
                              <SelectItem
                                key={account.id}
                                value={account.id.toString()}
                              >
                                {account.type === "checking"
                                  ? "Checking Account"
                                  : account.type === "savings"
                                  ? "Savings Account"
                                  : "Credit Card"}{" "}
                                - {formatCurrency(account.balance)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-neutral-500">$</span>
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          className="pl-7 pr-12"
                        />
                      </FormControl>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-neutral-500">USD</span>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter a description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="mr-3"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <div className="h-5 w-5 border-2 border-white rounded-full animate-spin"></div>
                  ) : (
                    getTransactionButtonText()
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  );
}
