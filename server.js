const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const os = require("os");

const app = express();

const PORT = 3000;

// 👉 CAMINHO DA REDE
const pastaPrincipal = "\\\\stp10008675n001.file.core.windows.net\\brilab\\BRIWS\\Ordens de Serviço\\entradas_WS";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// ============================
// LIMPAR NOME
// ============================
function limparNome(nome) {
    return nome.replace(/[<>:"/\\|?*]/g, "").trim();
}

// ============================
// MULTER
// ============================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        try {

            let nota = req.body.nota || "SEM_NOTA";
            nota = limparNome(nota);

            const pastaNota = path.join(pastaPrincipal, nota);

            // 👉 cria pasta da nota
            fs.mkdirSync(pastaNota, { recursive: true });

            console.log("📁 Pasta criada:", pastaNota);

            cb(null, pastaNota);

        } catch (err) {
            console.log("❌ Erro ao criar pasta:", err);
            cb(err);
        }
    },

    filename: function (req, file, cb) {

        const nome = Date.now() + ".jpg";

        console.log("🖼 Salvando arquivo:", nome);

        cb(null, nome);
    }
});

const upload = multer({ storage });

// ============================
// UPLOAD
// ============================

app.post("/upload", upload.array("fotos"), (req, res) => {

    try {

        console.log("📦 Nota:", req.body.nota);
        console.log("📷 Fotos recebidas:", req.files.length);

        req.files.forEach(file => {
            console.log("✅ Salvo em:", file.path);
        });

        res.send("Upload OK");

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro no servidor");
    }
});

// ============================
// DESCOBRIR IP
// ============================

function pegarIP() {

    const nets = os.networkInterfaces();

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {

            if (net.family === "IPv4" && !net.internal) {
                return net.address;
            }
        }
    }

    return "localhost";
}

// ============================
// START
// ============================

app.listen(PORT, "0.0.0.0", () => {

    const ip = pegarIP();

    console.log("================================");
    console.log("🚀 Servidor iniciado");
    console.log("Local:", "http://localhost:" + PORT);
    console.log("Rede :", "http://" + ip + ":" + PORT);
    console.log("Destino:", pastaPrincipal);
    console.log("================================");
});