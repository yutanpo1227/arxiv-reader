"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function SignIn() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await signIn("google", { 
        callbackUrl: "/",
        redirect: false 
      })
      
      if (result?.error) {
        setError("ログインに失敗しました。もう一度お試しください。")
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (err) {
      setError("予期せぬエラーが発生しました。もう一度お試しください。")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white dark:bg-zinc-800 p-8 shadow-md">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-zinc-900 dark:text-zinc-100"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              <path d="m9 9.5 2 2 4-4" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            arXiv Reader
          </h2>
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            最新の研究論文を日本語で読む
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="group relative flex w-full justify-center items-center rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="absolute left-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
            </div>
            <span className="ml-4">Googleでログイン{loading && "中..."}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
