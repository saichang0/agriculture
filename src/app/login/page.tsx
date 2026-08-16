"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { LOGIN } from "@/lib/queries";
import { setToken } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, { loading, error }] = useMutation(LOGIN);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const { data } = await login({ variables: { username, password } });
    if (data?.login?.token) {
      setToken(data.login.token);
      router.push("/");
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-1">
      {/* Left: visual panel */}
      <div className="relative hidden flex-1 overflow-hidden bg-sidebar-bg md:block">
        <div className="pointer-events-none absolute -top-24 -left-24 h-128 w-lg rounded-full bg-primary-hover/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-24 h-112 w-md rounded-full bg-success/20 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-black/30" />

        <div className="relative flex h-full flex-col justify-end p-14 text-white">
          <h2 className="text-5xl font-semibold leading-tight">
            ອຸປະກອນການກະເສດ
            <br />
            ຄົບວົງຈອນ
          </h2>
          <p className="mt-4 max-w-md text-lg text-white/80">
            ລະບົບຂາຍໜ້າຮ້ານ ໄວ ແລະ ແມ່ນຍຳ ສຳລັບຮ້ານອຸປະກອນການກະເສດຂອງເຈົ້າ
          </p>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex w-full flex-1 flex-col items-center justify-center bg-surface px-8 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-control bg-primary text-primary-text text-xl font-bold">
              ກ
            </div>
            <h1 className="text-3xl font-semibold text-text-primary">ຍິນດີຕ້ອນຮັບ</h1>
            <p className="mt-2 text-text-secondary">ເຂົ້າສູ່ລະບົບເພື່ອເລີ່ມການຂາຍ</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              id="username"
              label="ຊື່ຜູ້ໃຊ້"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
            <Input
              id="password"
              type="password"
              label="ລະຫັດຜ່ານ"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            {error && (
              <div className="rounded-control bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
                ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ
              </div>
            )}

            <Button type="submit" fullWidth size="lg" disabled={loading} className="mt-2">
              {loading ? "ກຳລັງເຂົ້າສູ່ລະບົບ..." : "ເຂົ້າສູ່ລະບົບ"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
