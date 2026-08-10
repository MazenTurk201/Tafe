import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register(username, password);

      navigate("/login", {
        replace: true,
      });
    } catch (error: any) {
      setError(
        error.response?.data?.message ??
        "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center px-4">

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900"
      >

        <h1 className="text-center text-3xl font-bold">
          Register
        </h1>

        {error && (
          <div className="rounded-lg bg-red-100 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
          required
          className="w-full rounded-lg border p-3 dark:bg-zinc-800"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
          className="w-full rounded-lg border p-3 dark:bg-zinc-800"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black p-3 text-white disabled:opacity-50"
        >
          {loading
            ? "Creating account..."
            : "Register"}
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-bold underline"
          >
            Login
          </button>
        </p>

      </form>
    </div>
  );
}