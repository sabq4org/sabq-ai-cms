"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SimpleAdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">تسجيل دخول المدير</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input type="email" placeholder="البريد الإلكتروني" />
          <Input type="password" placeholder="كلمة المرور" />
          <Button className="w-full">دخول</Button>
        </CardContent>
      </Card>
    </div>
  );
}
