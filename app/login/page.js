  "use client";

  import Link from "next/link";
  import { useState } from "react";
  import { useRouter } from "next/navigation";
  import { useAuth } from "../../context/AuthContext";
  import { fetchUserByEmail } from "../../lib/api";
  import { hashWithSalt } from "../../lib/security";

  export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) return;
    const user = await fetchUserByEmail(email);
    if (!user) {
      setError("Kullanıcı bulunamadı");
      return;
    }
    if (user.salt && user.passwordHash) {
      const hash = await hashWithSalt(user.salt, password);
      if (hash !== user.passwordHash) {
        setError("Parola hatalı");
        return;
      }
    }
    login(email);
    router.push("/profile");
  };
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch  -mb-8 min-h-[calc(100vh-100px)] w-full md:h-[calc(100vh-100px)]">
      <div className="flex flex-col justify-center items-center w-full px-6">
        <div className="pt-4 pb-8 w-full max-w-md mx-auto">
          <div className="mb-8 flex justify-center">
            <img src="/mobilogo.png" alt="MobiShop" className="h-[120px] w-auto" />
          </div>
          <h1 className="text-xl tracking-wide mb-8 text-center" style={{ color: "#223c6c" }}>OTURUM AÇ</h1>

          <form className="flex flex-col gap-5" onSubmit={onSubmit}>
            <div>
              <label className="text-xs tracking-widest block mb-2" htmlFor="email" style={{ color: "#223c6c" }}>E-POSTA</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder=""
                className="w-full border-0 border-b focus:outline-none focus:ring-0 bg-transparent py-2"
                style={{ borderColor: "#223c6c", borderBottomWidth: 1 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs tracking-widest block mb-2" htmlFor="password" style={{ color: "#223c6c" }}>PAROLA</label>
              <input
                id="password"
                name="password"
                type="password"
                className="w-full border-0 border-b focus:outline-none focus:ring-0 bg-transparent py-2"
                style={{ borderColor: "#223c6c", borderBottomWidth: 1 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Link href="/forgot-password" className="text-xs inline-block mt-2" style={{ color: "#223c6c" }}>Şifrenizi mi unuttunuz?</Link>
            </div>

            {error && <div className="text-xs text-red-600">{error}</div>}

            <button
              type="submit"
              className="h-11 uppercase text-xs tracking-widest"
              style={{ backgroundColor: "#223c6c", color: "#ffffff" }}
            >
              Oturum Aç
            </button>

            <Link href="/register" className="h-11 grid place-items-center uppercase text-xs tracking-widest bg-transparent" style={{ border: "1px solid #223c6c", color: "#223c6c" }}>
              KAYDOL
            </Link>

          </form>
        </div>
      </div>

      <div className="hidden md:block w-full md:h-[calc(100vh-132px)]">
        <img
          src="/login.png"
          alt="Login görseli"
          className="w-full h-full object-cover object-top"
        />
      </div>
    </section>
  );
}


