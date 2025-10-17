"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { createUser, fetchUserByEmail } from "../../lib/api";
import { generateSalt, hashWithSalt } from "../../lib/security";

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) return; 
    const exists = await fetchUserByEmail(email);
    if (!exists) {
      const salt = generateSalt();
      const passwordHash = await hashWithSalt(salt, password);
      await createUser({ email, name: fullName, phone, salt, passwordHash });
    }
    login(email);
    router.push("/profile");
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch -mx-6 -mb-8 min-h-[calc(100vh-100px)] w-full md:h-[calc(100vh-100px)]">
      <div className="hidden md:block w-full md:h-[calc(100vh-100px)] order-1">
        <img src="/register.png" alt="Register görseli" className="w-full h-full object-cover object-top" />
      </div>

      <div className="flex flex-col justify-center items-center w-full px-6 order-2">
        <div className="pt-4 pb-8 w-full max-w-md mx-auto">
          <div className="mb-8 flex justify-center">
            <img src="/mobilogo.png" alt="MobiShop" className="h-[120px] w-auto" />
          </div>
          <h1 className="text-xl tracking-wide mb-8 text-center" style={{ color: "#223c6c" }}>KAYIT OL</h1>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-xs tracking-widest block mb-2" htmlFor="fullname" style={{ color: "#223c6c" }}>AD SOYAD</label>
              <input
                id="fullname"
                name="fullname"
                type="text"
                className="w-full border-0 border-b focus:outline-none focus:ring-0 bg-transparent py-2"
                style={{ borderColor: "#223c6c", borderBottomWidth: 1 }}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs tracking-widest block mb-2" htmlFor="email" style={{ color: "#223c6c" }}>E-POSTA</label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full border-0 border-b focus:outline-none focus:ring-0 bg-transparent py-2"
                style={{ borderColor: "#223c6c", borderBottomWidth: 1 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs tracking-widest block mb-2" htmlFor="phone" style={{ color: "#223c6c" }}>TELEFON</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="w-full border-0 border-b focus:outline-none focus:ring-0 bg-transparent py-2"
                style={{ borderColor: "#223c6c", borderBottomWidth: 1 }}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs tracking-widest block mb-2" htmlFor="password" style={{ color: "#223c6c" }}>ŞİFRE</label>
              <input
                id="password"
                name="password"
                type="password"
                className="w-full border-0 border-b focus:outline-none focus:ring-0 bg-transparent py-2"
                style={{ borderColor: "#223c6c", borderBottomWidth: 1 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs tracking-widest block mb-2" htmlFor="confirm" style={{ color: "#223c6c" }}>ŞİFRE TEKRARI</label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                className="w-full border-0 border-b focus:outline-none focus:ring-0 bg-transparent py-2"
                style={{ borderColor: "#223c6c", borderBottomWidth: 1 }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="h-11 uppercase text-xs tracking-widest" style={{ backgroundColor: "#223c6c", color: "#ffffff" }}>
              Kaydol
            </button>

            <Link href="/login" className="h-11 grid place-items-center uppercase text-xs tracking-widest bg-transparent" style={{ border: "1px solid #223c6c", color: "#223c6c" }}>
              Oturum Aç
            </Link>
          </form>
        </div>
      </div>
    </section>
  );
}

