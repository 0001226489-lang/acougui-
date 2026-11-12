document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formFuncionario");
  const listaTabela = document.getElementById("listaFuncionarios");
  const inputBusca = document.getElementById("inputBusca");
  const btnLimparTudo = document.getElementById("btnLimparTudo");

  // --- LÓGICA DO FORMULÁRIO DE CADASTRO ---
  if (form) {
    const inputCEP = document.getElementById("cep");
    const cepStatus = document.getElementById("cepStatus");

    // Máscara de CPF
    document.getElementById("cpf").addEventListener("input", (e) => {
      let v = e.target.value.replace(/\D/g, "").slice(0, 11);
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      e.target.value = v;
    });

    // Máscara de CEP com Integração ViaCEP
    inputCEP.addEventListener("input", async (e) => {
      let v = e.target.value.replace(/\D/g, "").slice(0, 8);
      e.target.value = v.replace(/^(\d{5})(\d)/, "$1-$2");

      if (v.length === 8) {
        cepStatus.textContent = "Buscando...";
        try {
          const res = await fetch(`https://viacep.com.br/ws/${v}/json/`);
          const data = await res.json();

          if (!data.erro) {
            document.getElementById("logradouro").value = data.logradouro;
            document.getElementById("bairro").value = data.bairro;
            document.getElementById("cidade").value = data.localidade;
            document.getElementById("uf").value = data.uf;
            cepStatus.textContent = "✓ Encontrado";
            document.getElementById("numero").focus();
          } else {
            cepStatus.textContent = "❌ CEP não encontrado";
          }
        } catch (err) {
          cepStatus.textContent = "❌ Erro ao buscar CEP";
        }
      } else {
        cepStatus.textContent = "";
      }
    });

    // Salvar funcionário
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const funcionario = Object.fromEntries(formData.entries());
      funcionario.id = Date.now();

      const funcionarios = JSON.parse(localStorage.getItem("funcionariosAcougue")) || [];
      funcionarios.push(funcionario);
      localStorage.setItem("funcionariosAcougue", JSON.stringify(funcionarios));

      alert(`Funcionário ${funcionario.nome} cadastrado com sucesso!`);
      window.location.href = "index.html";
    });
  }

  // --- LÓGICA DA LISTA / TABELA ---
  if (listaTabela) {
    let funcionarios = JSON.parse(localStorage.getItem("funcionariosAcougue")) || [];

    function renderizarTabela(dados) {
      if (dados.length === 0) {
        listaTabela.innerHTML = `<tr><td colspan="7" class="empty-msg">Nenhum funcionário encontrado.</td></tr>`;
        return;
      }

      listaTabela.innerHTML = dados.map(f => `
        <tr>
          <td><strong>${f.nome}</strong></td>
          <td>${f.cargo}</td>
          <td>${f.especialidade || '-'}</td>
          <td>${f.turno}</td>
          <td>R$ ${parseFloat(f.salario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          <td>${f.cidade}/${f.uf}</td>
          <td style="text-align: center;">
            <button class="btn btn-delete" onclick="excluirFuncionario(${f.id})">Excluir</button>
          </td>
        </tr>
      `).join("");
    }

    window.excluirFuncionario = (id) => {
      if (confirm("Tem certeza que deseja excluir este funcionário?")) {
        funcionarios = funcionarios.filter(f => f.id !== id);
        localStorage.setItem("funcionariosAcougue", JSON.stringify(funcionarios));
        renderizarTabela(funcionarios);
      }
    };

    if (btnLimparTudo) {
      btnLimparTudo.addEventListener("click", () => {
        if (confirm("ATENÇÃO: Deseja apagar TODOS os funcionários cadastrados?")) {
          localStorage.removeItem("funcionariosAcougue");
          funcionarios = [];
          renderizarTabela([]);
        }
      });
    }

    if (inputBusca) {
      inputBusca.addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase();
        const filtrados = funcionarios.filter(f => 
          f.nome.toLowerCase().includes(termo) ||
          f.cargo.toLowerCase().includes(termo) ||
          (f.especialidade && f.especialidade.toLowerCase().includes(termo))
        );
        renderizarTabela(filtrados);
      });
    }

    renderizarTabela(funcionarios);
  }
});