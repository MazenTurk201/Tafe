import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";
import { getApiError } from "../../../lib/api-error";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register({
        firstName,
        lastName,
        userName,
        email,
        password,
        confirmPassword,
        address,
      });

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      setError(
        getApiError(error, "Registration failed")
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

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) =>
              setFirstName(e.target.value)
            }
            required
            className="w-full rounded-lg border p-3 dark:bg-zinc-800"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) =>
              setLastName(e.target.value)
            }
            className="w-full rounded-lg border p-3 dark:bg-zinc-800"
          />
        </div>

        <input
          type="text"
          placeholder="Username"
          value={userName}
          onChange={(e) =>
            setUserName(e.target.value)
          }
          required
          className="w-full rounded-lg border p-3 dark:bg-zinc-800"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
          className="w-full rounded-lg border p-3 dark:bg-zinc-800"
        />

        <input
          type="text"
          placeholder="Address (optional)"
          value={address}
          onChange={(e) =>
            setAddress(e.target.value)
          }
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
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
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