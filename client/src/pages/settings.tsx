import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, changePasswordSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
import { Card } from "@/components/ui/card";

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  // Profile form
  const profileForm = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
    },
    values: user,
  });

  // Password form
  const passwordForm = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update profile mutation
  const profileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof updateProfileSchema>) => {
      return apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update profile",
      });
    },
  });

  // Update password mutation
  const passwordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof changePasswordSchema>) => {
      return apiRequest("PUT", "/api/profile/password", data);
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update password",
      });
    },
  });

  const onProfileSubmit = (data: z.infer<typeof updateProfileSchema>) => {
    profileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: z.infer<typeof changePasswordSchema>) => {
    passwordMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="animate-pulse">
          <div className="p-6 h-64"></div>
        </Card>
        <Card className="animate-pulse">
          <div className="p-6 h-64"></div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-neutral-900">
            Account Settings
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">
            Personal details and account preferences.
          </p>
        </div>

        <div className="border-t border-neutral-200 px-4 py-5 sm:p-6">
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <FormField
                  control={profileForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Phone number</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={profileMutation.isPending || !profileForm.formState.isDirty}
                >
                  {profileMutation.isPending ? (
                    <div className="h-5 w-5 border-2 border-white rounded-full animate-spin"></div>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Card>

      <Card>
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-neutral-900">
            Security Settings
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">
            Update your password and security preferences.
          </p>
        </div>

        <div className="border-t border-neutral-200 px-4 py-5 sm:p-6">
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={passwordMutation.isPending || !passwordForm.formState.isDirty}
                >
                  {passwordMutation.isPending ? (
                    <div className="h-5 w-5 border-2 border-white rounded-full animate-spin"></div>
                  ) : (
                    "Update password"
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
