"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
    const router = useRouter()

    useEffect(() => {
        router.push("/login")
    }, [router])

    return <p style={{ textAlign: "center", marginTop: "40px" }}>Redirecionando...</p>
}
