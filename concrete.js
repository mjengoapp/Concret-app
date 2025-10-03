const express = require("express");
const mixes = require("./mixes");
const Concrete = mixes.Concrete
const app=express()
// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.get(
    "/",
    (
        req,
        res
    )=>{
            res.send(
                `
                    <html>
                    <head>
                        <link
                            rel="stylesheet"
                            href="/styles.css"
                        >
                    </head>
                    <body>
                    <h1>
                    CONCRETE MIX
                    </h1>
                    <form
                        action = "submit"
                        method = "POST"
                    >
                        <label
                            for = "concreteVolume"
                        >
                            volume in m²
                        </label>
                        <input
                            type = "number"
                            name="concreteVolume"
                            placeholder="volume in m²"
                        >
                        <label
                            for = "concreteRatio"
                        >
                            ratio
                        </label>
                        <input
                            type = "text"
                            name="concreteRatio"
                            placeholder="1:2:4"
                        >
                        <input
                            type = "submit"
                        >
                    </form>
                    </body>
                    </html>
                `
            )
        }
)
app.post(
    "/submit",
    (
        req,
        res
    )=>{
            const {
                concreteVolume,
                concreteRatio
            }=req.body;
            let concrete=new Concrete(
                parseFloat(
                    concreteVolume
                ),
                1.54,
                concreteRatio,
                true
                )
            results = concrete.getCost()

            res.send(
                `
                    <html>
                    <head>
                        <link
                            rel="stylesheet"
                            href="/styles.css"
                        >
                    </head>
                    <body>
                    <h1>
                        CONCRETE MIX DATA
                    </h1>
                    <p>
                        volume:${concreteVolume}]
                    </p>
                    <p>
                        ratio:${concreteRatio}]
                    </p>
                    <h2>Materials</h2>
                    <ul>
                        ${
                            results.map(
                                r => `<li>${r}</li>`
                            ).join(
                                ""
                            )
                        }
                        </ul>
                    <a href="/">go back</a>
                    </body>
                    </html>
                `
            )
        }
)
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
