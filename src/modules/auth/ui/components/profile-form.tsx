"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";

// UI Components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Auth
import { authClient } from "@/modules/auth/lib/auth-client";

// Helper function to convert image to base64
const convertImageToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const ProfileForm = () => {
  const router = useRouter();
  const { data } = authClient.useSession();

  // Edit Profile State
  const [name, setName] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [signOutDevices, setSignOutDevices] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true);
    try {
      await authClient.updateUser({
        image: image ? await convertImageToBase64(image) : undefined,
        name: name || undefined,
        fetchOptions: {
          onSuccess: () => {
            toast.success("Profile updated successfully");
            setName("");
            setImage(null);
            setImagePreview(null);
            router.refresh();
          },
          onError: (error) => {
            toast.error(error.error.message || "Failed to update profile");
          },
        },
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await authClient.changePassword({
        newPassword: newPassword,
        currentPassword: currentPassword,
        revokeOtherSessions: signOutDevices,
      });

      if (res.error) {
        toast.error(
          res.error.message ||
            "Couldn't change your password! Make sure it's correct"
        );
      } else {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSignOutDevices(false);
        router.refresh();
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="mb-3 inline-flex h-9 w-fit justify-start gap-1 rounded-md bg-transparent p-0">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>

      {/* Profile Tab */}
      <TabsContent value="profile">
        <Card className="rounded-xl border-0 bg-white py-0 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
          <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
            <CardTitle className="text-[14px] font-medium tracking-[-0.28px] text-[#171717] dark:text-[#FAFAFA]">
              Profile details
            </CardTitle>
            <CardDescription className="text-xs text-[#8F8F8F]">
              Update the name and image shown on your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-5 pb-5 sm:px-6 sm:pb-6">
            {/* Profile Picture Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-[#4D4D4D] dark:text-[#B3B3B3]">
                Profile image
              </Label>
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                {/* Image Preview */}
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative size-20 overflow-hidden rounded-full bg-[#F2F2F2] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#262626]">
                      <Image
                        src={imagePreview}
                        alt="Profile preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : data?.user.image ? (
                    <div className="relative size-20 overflow-hidden rounded-full bg-[#F2F2F2] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#262626]">
                      <Image
                        src={data.user.image}
                        alt="Current profile"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex size-20 items-center justify-center rounded-full bg-[#F2F2F2] text-lg font-medium text-[#4D4D4D] dark:bg-[#262626] dark:text-[#B3B3B3]">
                      {data?.user.name?.slice(0, 1).toUpperCase() || "?"}
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1 space-y-2">
                  <p className="text-xs text-[#8F8F8F]">
                    Choose a square image for your account avatar.
                  </p>
                  <div className="relative">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-md border-0 bg-white text-sm text-[#4D4D4D] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] hover:bg-[#EBEBEB] dark:bg-[#171717] dark:text-[#B3B3B3] dark:hover:bg-[#262626]"
                      onClick={() => document.getElementById("image")?.click()}
                    >
                      <Upload className="size-4" />
                      Choose image
                    </Button>
                  </div>
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs text-[#4D4D4D] hover:bg-[#EBEBEB] hover:text-[#171717] dark:text-[#B3B3B3] dark:hover:bg-[#262626] dark:hover:text-[#FAFAFA]"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                    >
                      <X className="size-3.5" />
                      Remove image
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Name Section */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-[#4D4D4D] dark:text-[#B3B3B3]">
                Full name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name || data?.user.name || ""}
                onChange={(e) => setName(e.target.value)}
                className="h-10 border-0 bg-[#FAFAFA] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] focus-visible:ring-0 dark:bg-[#0A0A0A]"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleUpdateProfile}
              disabled={
                isUpdatingProfile ||
                (!image && (!name || name === data?.user.name))
              }
              className="h-10 w-full rounded-md bg-[#0072F5] text-sm font-medium text-white shadow-none hover:bg-[#005FCC]"
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save profile"
              )}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Password Tab */}
      <TabsContent value="password">
        <Card className="rounded-xl border-0 bg-white py-0 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#171717]">
          <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
            <CardTitle className="text-[14px] font-medium tracking-[-0.28px] text-[#171717] dark:text-[#FAFAFA]">
              Change password
            </CardTitle>
            <CardDescription className="text-xs text-[#8F8F8F]">
              Use a unique password to secure your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6">
            {/* Current Password */}
            <div className="space-y-3">
              <Label htmlFor="current-password" className="text-sm font-medium text-[#4D4D4D] dark:text-[#B3B3B3]">
                Current password
              </Label>
              <PasswordInput
                id="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="h-10 border-0 bg-[#FAFAFA] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] focus-visible:ring-0 dark:bg-[#0A0A0A]"
              />
            </div>

            {/* New Password */}
            <div className="space-y-3">
              <Label htmlFor="new-password" className="text-sm font-medium text-[#4D4D4D] dark:text-[#B3B3B3]">
                New password
              </Label>
              <PasswordInput
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password (min. 8 characters)"
                className="h-10 border-0 bg-[#FAFAFA] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] focus-visible:ring-0 dark:bg-[#0A0A0A]"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-3">
              <Label
                htmlFor="confirm-password"
                className="text-sm font-medium text-[#4D4D4D] dark:text-[#B3B3B3]"
              >
                Confirm password
              </Label>
              <PasswordInput
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="h-10 border-0 bg-[#FAFAFA] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] focus-visible:ring-0 dark:bg-[#0A0A0A]"
              />
            </div>

            {/* Sign Out Other Devices */}
            <div className="flex items-center gap-3 rounded-lg bg-[#FAFAFA] p-3 dark:bg-[#0A0A0A]">
              <Checkbox
                id="sign-out-devices"
                checked={signOutDevices}
                onCheckedChange={(checked) =>
                  setSignOutDevices(checked as boolean)
                }
              />
              <Label
                htmlFor="sign-out-devices"
                className="mb-0 flex-1 cursor-pointer text-sm text-[#4D4D4D] dark:text-[#B3B3B3]"
              >
                Sign out from all other devices
              </Label>
            </div>

            {/* Change Password Button */}
            <Button
              onClick={handleChangePassword}
              disabled={
                isChangingPassword ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="h-10 w-full rounded-md bg-[#0072F5] text-sm font-medium text-white shadow-none hover:bg-[#005FCC]"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
