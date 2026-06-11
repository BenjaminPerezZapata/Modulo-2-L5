$(document).ready(function() {

 
  if (localStorage.getItem('walletBalance') === null) {
    localStorage.setItem('walletBalance', '60000');
  }

  
  if ($('#loginForm').length) {
    $('#loginForm').submit(function(e) {
      e.preventDefault();
      
      const email = $('#email').val().trim();
      const password = $('#password').val();
      const $alertContainer = $('#alert-container');

      if (email === "user@wallet.com" && password === "123456") {
        $alertContainer.html('<div class="alert alert-success">¡Ingreso exitoso! Redirigiendo...</div>');
        setTimeout(function() {
          window.location.href = "./menu.html";
        }, 1500);
      } else {
        $alertContainer.html('<div class="alert alert-danger">Credenciales incorrectas. Intente de nuevo.</div>');
      }
    });
  }

  
  if ($('#displayBalance').length) {
    const currentBalance = localStorage.getItem('walletBalance') || '60000';
    $('#displayBalance').text('$' + parseInt(currentBalance).toLocaleString('es-CL'));

    $('.navigation-btn').click(function() {
      const targetPage = $(this).data('target');
      const pageName = $(this).data('name');
      const $msgDiv = $('#redirectMessage');
      
      $msgDiv.text('Redirigiendo a ' + pageName + '...').removeClass('d-none');

      setTimeout(function() {
        window.location.href = targetPage;
      }, 1200);
    });
  }

  
  if ($('#depositForm').length) {
    let currentBalance = parseInt(localStorage.getItem('walletBalance') || '60000');
    $('#currentDepositBalance').text('$' + currentBalance.toLocaleString('es-CL'));

    $('#depositForm').submit(function(e) {
      e.preventDefault();
      
      const amount = parseInt($('#depositAmount').val());
      if (isNaN(amount) || amount <= 0) return;

      let newBalance = currentBalance + amount;
      localStorage.setItem('walletBalance', newBalance.toString());

      let transactions = JSON.parse(localStorage.getItem('walletTransactions') || '[]');
      transactions.unshift({ description: 'Depósito realizado', amount: `+$${amount}`, type: 'deposito' });
      localStorage.setItem('walletTransactions', JSON.stringify(transactions));

      $('#visual-confirmation').text('Has depositado con éxito: $' + amount.toLocaleString('es-CL'));
      $('#alert-container').html('<div class="alert alert-success">Depósito exitoso. Redirigiendo en 2 segundos...</div>');

      setTimeout(function() {
        window.location.href = "menu.html";
      }, 2000);
    });
  }

  
  if ($('#contactList').length) {
    let selectedContactName = "";

    $('#btnToggleContact').click(function() {
      $('#contactFormContainer').removeClass('d-none');
    });

    $('#btnCancelContact').click(function() {
      $('#contactFormContainer').addClass('d-none');
      $('#addContactForm')[0].reset();
    });

    $('#addContactForm').submit(function(e) {
      e.preventDefault();
      const name = $('#newName').val().trim();
      const cbu = $('#newCbu').val().trim();
      const alias = $('#newAlias').val().trim();
      const bank = $('#newBank').val().trim();

      if(!name || !cbu || !alias || !bank) {
        alert("Todos los campos obligatorios deben estar completos.");
        return;
      }
      if(isNaN(cbu)) {
        alert("El CBU debe contener solo números.");
        return;
      }

      $('#contactList').append(`
        <li class="list-group-item d-flex justify-content-between align-items-center contact-item">
          <div>
            <strong class="contact-name">${name}</strong>
            <small class="text-muted d-block contact-alias">Alias: ${alias} | CBU: ${cbu} (${bank})</small>
          </div>
        </li>
      `);

      $('#contactFormContainer').addClass('d-none');
      this.reset();
    });

    $('#searchContact').on('keyup', function() {
      const value = $(this).val().toLowerCase();
      $('#contactList .contact-item').filter(function() {
        const nameMatch = $(this).find('.contact-name').text().toLowerCase().indexOf(value) > -1;
        const aliasMatch = $(this).find('.contact-alias').text().toLowerCase().indexOf(value) > -1;
        $(this).toggle(nameMatch || aliasMatch);
      });
    });

    $('#contactList').on('click', '.contact-item', function() {
      $('.contact-item').removeClass('bg-primary text-white');
      $(this).addClass('bg-primary text-white');
      
      selectedContactName = $(this).find('.contact-name').text();
      $('#btnEnviarDinero').removeClass('d-none');
    });

    $('#btnEnviarDinero').click(function() {
      const monto = 5000;
      let currentBalance = parseInt(localStorage.getItem('walletBalance') || '60000');

      if(currentBalance >= monto) {
        currentBalance -= monto;
        localStorage.setItem('walletBalance', currentBalance.toString());

        let transactions = JSON.parse(localStorage.getItem('walletTransactions') || '[]');
        transactions.unshift({ description: `Transferencia a ${selectedContactName}`, amount: `-$${monto}`, type: 'compra' });
        localStorage.setItem('walletTransactions', JSON.stringify(transactions));

        $('#sendAlert').html(`<div class="alert alert-success">¡Envío realizado con éxito a ${selectedContactName}! Saldo actualizado.</div>`);
        $('.contact-item').removeClass('bg-primary text-white');
        $('#btnEnviarDinero').addClass('d-none');
        
        setTimeout(function() { window.location.href = "menu.html"; }, 2000);
      } else {
        $('#sendAlert').html('<div class="alert alert-danger">Error: Saldo insuficiente para procesar el envío.</div>');
      }
    });
  }

  
  if ($('#transactionsContainer').length) {
    const listaTransacciones = [
      { description: "Compra en línea", amount: "-$50.00", type: "compra" },
      { description: "Depósito", amount: "+$100.00", type: "deposito" },
      { description: "Transferencia recibida", amount: "+$75.00", type: "transferencia" },
      { description: "Compra en línea", amount: "-$5,550.00", type: "compra" },
      { description: "Depósito misma cuenta", amount: "+$10,500.00", type: "deposito" },
      { description: "Transferencia recibida", amount: "+$7,575.00", type: "transferencia" }
    ];

    function getTipoTransaccion(type) {
      switch(type) {
        case 'compra': return 'Egresos / Compras';
        case 'deposito': return 'Depósitos';
        case 'transferencia': return 'Transferencias';
        default: return 'Otros';
      }
    }

    function mostrarUltimosMovimientos(filtro) {
      const $container = $('#transactionsContainer');
      $container.empty();

      let customTransactions = JSON.parse(localStorage.getItem('walletTransactions') || '[]');
      const listaCompleta = [...customTransactions, ...listaTransacciones];

      listaCompleta.forEach(function(t) {
        if (filtro !== 'todos' && t.type !== filtro) return;

        const isNegative = t.amount.includes('-');
        const badgeClass = isNegative ? 'bg-danger' : 'bg-success';
        const tipoTexto = getTipoTransaccion(t.type);

        $container.append(`
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <span>${t.description}</span>
              <small class="text-muted d-block" style="font-size: 0.75rem;">Categoría: ${tipoTexto}</small>
            </div>
            <span class="badge ${badgeClass} rounded-pill">${t.amount}</span>
          </li>
        `);
      });
    }

  
    mostrarUltimosMovimientos('todos');

    $('#filterType').change(function() {
      mostrarUltimosMovimientos($(this).val());
    });
  }

});