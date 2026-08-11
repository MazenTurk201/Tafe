import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";
import { getApiError } from "../../../lib/api-error";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememmberMe, setrememmberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(username, password, rememmberMe);

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      setError(
        getApiError(
          error,
          "Username or password is incorrect"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] h-dvh w-full items-center justify-center px-4 bg-purple-500">

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900"
      >

        <h1 className="text-center text-3xl font-bold">
          Login
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

        <input
          type="checkbox"
          name="rememmberMe"
          id="rememmberMe"
          checked={rememmberMe}
          onChange={(e) =>
            setrememmberMe(e.target.checked)
          }
        />

        <span>Rememmber Me</span>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black p-3 text-white disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm">
          Don't have an account?{" "}

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="font-bold underline"
          >
            Register
          </button>
        </p>

      </form>
    </div>
  );
}