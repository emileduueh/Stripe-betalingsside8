<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Betal</title>
  <script src="https://js.stripe.com/v3/"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }

    .kort {
      background: #fff;
      border-radius: 16px;
      padding: 2rem;
      max-width: 460px;
      width: 100%;
      box-shadow: 0 2px 16px rgba(0,0,0,0.07);
    }

    h1 {
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: #111;
    }

    label {
      font-size: 13px;
      color: #666;
      display: block;
      margin-bottom: 5px;
    }

    input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 15px;
      margin-bottom: 1rem;
      outline: none;
      transition: border 0.2s;
    }

    input:focus { border-color: #555; }

    #card-element {
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #fafafa;
      margin-bottom: 1rem;
    }

    #fejl {
      font-size: 13px;
      color: #c0392b;
      margin-bottom: 1rem;
      min-height: 18px;
    }

    button {
      width: 100%;
      padding: 13px;
      background: #111;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    button:hover:not(:disabled) { background: #333; }
    button:disabled { background: #aaa; cursor: not-allowed; }

    #succes {
      display: none;
      text-align: center;
      padding: 2rem 0 1rem;
    }

    #succes .ikon { font-size: 48px; margin-bottom: 1rem; }
    #succes h2 { font-size: 20px; color: #111; margin-bottom: 0.5rem; }
    #succes p { font-size: 14px; color: #666; }

    .sikker {
      text-align: center;
      font-size: 12px;
      color: #aaa;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="kort">
    <div id="formular">
      <h1>Betal nu</h1>

      <label>Fulde navn</label>
      <input type="text" id="navn" placeholder="Jens Jensen" />

      <label>Email</label>
      <input type="email" id="email" placeholder="jens@eksempel.dk" />

      <label>Beløb (DKK)</label>
      <input type="number" id="beloeb" placeholder="500" min="1" />

      <label>Kortoplysninger</label>
      <div id="card-element"></div>

      <div id="fejl"></div>

      <button id="betal-knap" onclick="betal()">Betal</button>

      <p class="sikker">🔒 Sikret af Stripe</p>
    </div>

    <div id="succes">
      <div class="ikon">✅</div>
      <h2>Betaling gennemført!</h2>
      <p>Tak for din betaling. Du modtager en kvittering på email.</p>
    </div>
  </div>

  <script>
    const stripe = Stripe('pk_live_51Tk4gG0z9T2X0M8huwQWbfIt6XD15jrMBAZSNmUW58M1NLo8QrpkThK4WE9cI9OPFwbwPI8Tt9kS6SK1zE6bi72y008EcgSD6n');
    const elements = stripe.elements();
    const card = elements.create('card', {
      style: {
        base: { fontSize: '15px', color: '#111', '::placeholder': { color: '#aaa' } }
      }
    });
    card.mount('#card-element');

    card.on('change', e => {
      document.getElementById('fejl').textContent = e.error ? e.error.message : '';
    });

    async function betal() {
      const navn = document.getElementById('navn').value.trim();
      const email = document.getElementById('email').value.trim();
      const beloeb = parseFloat(document.getElementById('beloeb').value);
      const fejlEl = document.getElementById('fejl');
      const knap = document.getElementById('betal-knap');

      if (!navn || !email || !beloeb || beloeb < 1) {
        fejlEl.textContent = 'Udfyld venligst alle felter.';
        return;
      }

      knap.textContent = 'Behandler...';
      knap.disabled = true;
      fejlEl.textContent = '';

      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card,
        billing_details: { name: navn, email }
      });

      if (error) {
        fejlEl.textContent = error.message;
        knap.textContent = 'Betal';
        knap.disabled = false;
        return;
      }

      const svar = await fetch('/betal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: paymentMethod.id, amount: beloeb, name: navn, email })
      });

      const data = await svar.json();

      if (data.error) {
        fejlEl.textContent = data.error;
        knap.textContent = 'Betal';
        knap.disabled = false;
      } else {
        document.getElementById('formular').style.display = 'none';
        document.getElementById('succes').style.display = 'block';
      }
    }
  </script>
</body>
</html>
