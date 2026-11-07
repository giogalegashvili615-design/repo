package com.mathagent

import java.math.BigDecimal
import kotlin.math.*

typealias Fn = (Double) -> Double

data class Solved(val steps: List<String>, val ans: String, val alt: String = "", val graph: String? = null)

fun F(n: Double): String {
    if (!n.isFinite()) return "undefined"
    val r = Math.round(n * 1e6) / 1e6
    return BigDecimal.valueOf(r).stripTrailingZeros().toPlainString().replace("-", "−")
}

fun fr(n: Double): String {
    if (n == floor(n)) return F(n)
    for (q in 2..1000) {
        val p = Math.round(n * q)
        if (abs(n * q - p) < 1e-9) return "${F(p.toDouble())}/$q"
    }
    return F(n)
}

fun coef(n: Double) = if (n == 1.0) "" else if (n == -1.0) "−" else F(n)

fun poly(a: Double, b: Double, c: Double): String {
    var s = coef(a) + "x²"
    if (b != 0.0) s += " ${if (b < 0) "−" else "+"} ${if (abs(b) == 1.0) "" else F(abs(b))}x"
    if (c != 0.0) s += " ${if (c < 0) "−" else "+"} ${F(abs(c))}"
    return s
}

fun prep(s: String): String =
    s.lowercase().replace("×", "*").replace("·", "*").replace("÷", "/")
        .replace("−", "-").replace("–", "-").replace("π", "pi").replace("√", "sqrt")
        .replace("²", "^2").replace("³", "^3").replace(Regex("\\s+"), "")
        .replace(Regex("(\\d|\\)|x|pi)(?=x|\\(|pi|sqrt|sin|cos|tan|log|ln|abs)"), "\$1*")

/** Small recursive-descent parser. Unary minus binds looser than ^, so -x^2 = -(x^2). */
class Parser(src: String) {
    private val t = Regex("\\d*\\.?\\d+|[a-z]+|[-+*/^(),]").findAll(src).map { it.value }.toList()
    private var i = 0

    init { require(t.isNotEmpty() && t.joinToString("") == src) }

    private fun pk(): String? = t.getOrNull(i)
    private fun nx(): String? = t.getOrNull(i++)

    fun parse(): Fn { val f = expr(); require(i >= t.size); return f }

    private fun bin(o: String, a: Fn, b: Fn): Fn {
        if (o == "+") return { x -> a(x) + b(x) }
        if (o == "-") return { x -> a(x) - b(x) }
        if (o == "*") return { x -> a(x) * b(x) }
        return { x -> a(x) / b(x) }
    }

    private fun expr(): Fn {
        var f = term()
        while (pk() == "+" || pk() == "-") { val o = nx()!!; f = bin(o, f, term()) }
        return f
    }

    private fun term(): Fn {
        var f = un()
        while (pk() == "*" || pk() == "/") { val o = nx()!!; f = bin(o, f, un()) }
        return f
    }

    private fun un(): Fn {
        if (pk() == "-") { nx(); val a = un(); return { x -> -a(x) } }
        if (pk() == "+") { nx(); return un() }
        return pw()
    }

    private fun pw(): Fn {
        val a = at()
        if (pk() == "^") { nx(); val b = un(); return { x -> a(x).pow(b(x)) } }
        return a
    }

    private val fns: Map<String, Fn> = mapOf(
        "sqrt" to { v: Double -> sqrt(v) }, "sin" to { v: Double -> sin(v) },
        "cos" to { v: Double -> cos(v) }, "tan" to { v: Double -> tan(v) },
        "log" to { v: Double -> log10(v) }, "ln" to { v: Double -> ln(v) },
        "abs" to { v: Double -> abs(v) }
    )

    private fun at(): Fn {
        val k = nx() ?: throw IllegalArgumentException()
        if (k[0].isDigit() || k[0] == '.') { val n = k.toDouble(); return { _ -> n } }
        if (k == "(") { val f = expr(); require(nx() == ")"); return f }
        if (k == "x") return { x -> x }
        if (k == "pi") return { _ -> PI }
        if (k == "e") return { _ -> E }
        val fn = fns[k] ?: throw IllegalArgumentException()
        require(nx() == "(")
        val f = expr()
        require(nx() == ")")
        return { x -> fn(f(x)) }
    }
}

fun compile(prepped: String): Fn = Parser(prepped).parse()

fun roots(f: Fn, lo: Double, hi: Double): List<Double> {
    val out = mutableListOf<Double>()
    val n = 4000
    val h = (hi - lo) / n
    var a = lo
    var fa = f(a)
    for (k in 1..n) {
        if (out.size >= 8) break
        val b = lo + k * h
        val fb = f(b)
        if (fa.isFinite() && fb.isFinite() && fa * fb < 0) {
            var l = a
            var r = b
            repeat(50) { val m = (l + r) / 2; if (f(l) * f(m) <= 0) r = m else l = m }
            val v = (l + r) / 2
            if (abs(f(v)) < 1e-3 && out.none { abs(it - v) < 1e-3 }) out.add(v)
        }
        a = b; fa = fb
    }
    return out
}

fun solve(raw: String): Solved? {
    val s = prep(raw)
    Regex("^(\\d*\\.?\\d+)%of(\\d*\\.?\\d+)\$").find(s)?.let { m ->
        val p = m.groupValues[1].toDouble()
        val n = m.groupValues[2].toDouble()
        val r = p * n / 100
        return Solved(
            listOf(
                "Turn the percent into a decimal: ${F(p)}% = ${F(p)}/100 = ${F(p / 100)}",
                "Multiply: ${F(p / 100)} × ${F(n)} = ${F(r)}"
            ), F(r)
        )
    }
    return try { solveInner(s, raw) } catch (e: Exception) { null }
}

private fun solveInner(s: String, raw: String): Solved? {
    if ("=" in s) {
        val parts = s.split("=")
        require(parts.size == 2)
        val lhs = compile(parts[0])
        val rhs = compile(parts[1])
        val f: Fn = { x -> lhs(x) - rhs(x) }
        val f0 = f(0.0); val f1 = f(1.0); val fm = f(-1.0); val f2 = f(2.0)
        if (listOf(f1, fm, f2).all { abs(it - f0) < 1e-12 })
            return Solved(listOf("Left side = ${F(lhs(0.0))}, right side = ${F(rhs(0.0))}"), if (abs(f0) < 1e-9) "True" else "False")
        val a = (f1 + fm) / 2 - f0
        val b = (f1 - fm) / 2
        val c = f0
        val isP = listOf(f0, f1, fm, f2).all { it.isFinite() } && abs(4 * a + 2 * b + c - f2) < 1e-7 * (1 + abs(f2))
        if (isP && abs(a) < 1e-9) {
            if (abs(b) < 1e-9) return Solved(listOf("Everything on one side leaves no x."), if (abs(c) < 1e-9) "Every x works" else "No solution")
            val x = -c / b
            return Solved(
                listOf(
                    "Move everything to one side: ${coef(b)}x ${if (c < 0) "−" else "+"} ${F(abs(c))} = 0",
                    "Isolate the x term: ${coef(b)}x = ${F(-c)}",
                    "Divide both sides by ${F(b)}: x = ${fr(x)}",
                    "Check: x = ${fr(x)} gives ${F(lhs(x))} on the left and ${F(rhs(x))} on the right ✓"
                ), "x = ${fr(x)}"
            )
        }
        if (isP) {
            val d = b * b - 4 * a * c
            val st = mutableListOf(
                "Standard form: ${poly(a, b, c)} = 0",
                "Discriminant: b² − 4ac = ${F(b)}² − 4(${F(a)})(${F(c)}) = ${F(d)}"
            )
            if (d > 1e-9) {
                val sq = sqrt(d)
                val r1 = (-b - sq) / (2 * a)
                val r2 = (-b + sq) / (2 * a)
                st.add("D is positive, so there are two real roots.")
                st.add("x = (−b ± √D) ÷ 2a = (${F(-b)} ± ${F(sq)}) ÷ ${F(2 * a)}")
                return Solved(st, "x = ${fr(min(r1, r2))} or x = ${fr(max(r1, r2))}")
            }
            if (abs(d) <= 1e-9) {
                val x = -b / (2 * a)
                st.add("D is zero, so there is one repeated root.")
                st.add("x = −b ÷ 2a = ${fr(x)}")
                return Solved(st, "x = ${fr(x)}")
            }
            st.add("D is negative, so there are no real roots. The complex roots are:")
            return Solved(st, "x = ${F(-b / (2 * a))} ± ${F(sqrt(-d) / (2 * abs(a)))}i")
        }
        val rs = roots(f, -50.0, 50.0)
        return Solved(
            listOf("This isn't a polynomial up to x², so I scanned for where both sides meet."),
            if (rs.isNotEmpty()) rs.joinToString(", ") { "x ≈ ${F(it)}" } else "No real solution between −50 and 50"
        )
    }
    val f = compile(s)
    if (abs(f(1.0) - f(2.0)) > 1e-12 || abs(f(0.0) - f(3.0)) > 1e-12)
        return Solved(listOf("That expression contains x, so it has no single value.", "Add “= …” to solve for x, or plot it."), "A function of x", graph = raw.trim())
    val v = f(0.0)
    if (!v.isFinite()) return Solved(listOf("Read the expression: ${raw.trim()}", "Something in it divides by zero or has no real value."), "Undefined")
    val q = fr(v)
    return Solved(
        listOf("Read the expression: ${raw.trim()}", "Work in this order: brackets, powers, then × ÷, then + −.", "Result: $q"),
        q, if ("/" in q) "≈ ${F(v)}" else ""
    )
}
