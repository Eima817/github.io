
(function () {
  "use strict";

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".php-email-form");
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    const errorState = {
      first_name: "Privalomas laukas",
      last_name: "Privalomas laukas",
      email: "Privalomas laukas",
      address: "Privalomas laukas",
      phone: "Privalomas laukas"
    };

    function getInput(name) {
      return form.elements[name];
    }

    function setFieldError(name, message) {
      const input = getInput(name);
      if (!input) return;

      let err = input.parentElement.querySelector(".field-error");
      if (!err) {
        err = document.createElement("div");
        err.className = "field-error";
        input.parentElement.appendChild(err);
      }

      if (message) {
        input.classList.add("is-invalid");
        err.textContent = message;
        errorState[name] = message;
      } else {
        input.classList.remove("is-invalid");
        err.textContent = "";
        errorState[name] = "";
      }

      updateSubmitState();
    }

    function validateName(nameKey, label) {
      const input = getInput(nameKey);
      if (!input) return;

      const value = input.value.trim();
      if (!value) {
        setFieldError(nameKey, `${label} yra privalomas.`);
        return;
      }

      const nameRegex =
        /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž\s'-]+$/;
      if (!nameRegex.test(value)) {
        setFieldError(
          nameKey,
          `${label} turi būti sudarytas tik iš raidžių.`
        );
        return;
      }

      setFieldError(nameKey, "");
    }

    function validateEmail() {
      const input = getInput("email");
      if (!input) return;

      const value = input.value.trim();
      if (!value) {
        setFieldError("email", "El. paštas yra privalomas.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setFieldError("email", "Neteisingas el. pašto formatas.");
        return;
      }

      setFieldError("email", "");
    }

    function validateAddress() {
      const input = getInput("address");
      if (!input) return;

      const value = input.value.trim();
      if (!value) {
        setFieldError("address", "Adresas yra privalomas.");
        return;
      }

      if (value.length < 5) {
        setFieldError(
          "address",
          "Adresas atrodo per trumpas. Įveskite detalesnį."
        );
        return;
      }

      setFieldError("address", "");
    }

    function formatAndValidatePhone() {
      const input = getInput("phone");
      if (!input) return;

      let digits = input.value.replace(/\D/g, "");

      if (digits.startsWith("3706")) {
        digits = digits.slice(3);
      } else if (digits.startsWith("86")) {
        digits = digits.slice(1);
      } else if (digits.startsWith("6")) {
      } else if (digits.length > 0) {
        digits = "6" + digits;
      }

      digits = digits.slice(0, 8);

      let formatted = "";
      if (digits.length > 0) {
        const first = digits[0];
        const opPart = digits.slice(1, 3);
        const rest = digits.slice(3);

        formatted = `+370 ${first}`;
        if (opPart.length) {
          formatted += opPart;
        }
        if (rest.length) {
          formatted += " " + rest;
        }
      }

      input.value = formatted;

      let isValid = false;
      if (digits.length === 8 && digits[0] === "6") {
        isValid = true;
      }

      if (!formatted) {
        setFieldError("phone", "Telefono numeris yra privalomas.");
      } else if (!isValid) {
        setFieldError(
          "phone",
          "Neteisingas numeris. Naudokite formatą +370 6xx xxxxx."
        );
      } else {
        setFieldError("phone", "");
      }
    }

    function validateAll() {
      validateName("first_name", "Vardas");
      validateName("last_name", "Pavardė");
      validateEmail();
      validateAddress();
      formatAndValidatePhone();

      const hasError = Object.values(errorState).some((m) => m);
      return !hasError;
    }

    function updateSubmitState() {
      const requiredFields = [
        "first_name",
        "last_name",
        "email",
        "address",
        "phone"
      ];

      const hasError = Object.values(errorState).some((m) => m);
      const hasEmpty = requiredFields.some((name) => {
        const el = getInput(name);
        return !el || !el.value.trim();
      });

      const disabled = hasError || hasEmpty;
      submitBtn.disabled = disabled;
      if (disabled) {
        submitBtn.classList.add("btn-disabled");
      } else {
        submitBtn.classList.remove("btn-disabled");
      }
    }

    const firstNameInput = getInput("first_name");
    const lastNameInput = getInput("last_name");
    const emailInput = getInput("email");
    const addressInput = getInput("address");
    const phoneInput = getInput("phone");

    if (firstNameInput) {
      firstNameInput.addEventListener("input", () =>
        validateName("first_name", "Vardas")
      );
      firstNameInput.addEventListener("blur", () =>
        validateName("first_name", "Vardas")
      );
    }

    if (lastNameInput) {
      lastNameInput.addEventListener("input", () =>
        validateName("last_name", "Pavardė")
      );
      lastNameInput.addEventListener("blur", () =>
        validateName("last_name", "Pavardė")
      );
    }

    if (emailInput) {
      emailInput.addEventListener("input", validateEmail);
      emailInput.addEventListener("blur", validateEmail);
    }

    if (addressInput) {
      addressInput.addEventListener("input", validateAddress);
      addressInput.addEventListener("blur", validateAddress);
    }

    if (phoneInput) {
      phoneInput.addEventListener("input", formatAndValidatePhone);
      phoneInput.addEventListener("blur", formatAndValidatePhone);
    }

    updateSubmitState();

    const resultBox = document.createElement("div");
    resultBox.id = "contact-result";
    resultBox.className = "contact-result";
    form.parentElement.appendChild(resultBox);

    const popup = document.createElement("div");
    popup.className = "popup-success";
    popup.textContent = "Duomenys pateikti sekmingai!";
    document.body.appendChild(popup);

    form.addEventListener(
      "submit",
      function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (!validateAll()) {
          const errorMsg = form.querySelector(".error-message");
          if (errorMsg) {
            errorMsg.style.display = "block";
            errorMsg.textContent =
              "Prašome pataisyti pažymėtus laukus prieš pateikdami formą.";
          }
          return;
        }

        const data = {
          firstName: getInput("first_name")?.value.trim() || "",
          lastName: getInput("last_name")?.value.trim() || "",
          email: getInput("email")?.value.trim() || "",
          phone: getInput("phone")?.value.trim() || "",
          address: getInput("address")?.value.trim() || "",
          ratingCommunication: Number(
            getInput("rating_communication")?.value || 0
          ),
          ratingSkills: Number(getInput("rating_skills")?.value || 0),
          ratingReliability: Number(
            getInput("rating_reliability")?.value || 0
          )
        };

        console.log("Kontaktų formos duomenys:", data);

        const avg =
          (data.ratingCommunication +
            data.ratingSkills +
            data.ratingReliability) /
          3;
        const avgFormatted = avg.toFixed(1);
        const fullName = `${data.firstName} ${data.lastName}`.trim();

        resultBox.innerHTML = `
          <p><strong>Vardas:</strong> ${escapeHtml(data.firstName)}</p>
          <p><strong>Pavarde:</strong> ${escapeHtml(data.lastName)}</p>
          <p><strong>El. pastas:</strong> 
            <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(
          data.email
        )}</a>
          </p>
          <p><strong>Tel. numeris:</strong> ${escapeHtml(data.phone)}</p>
          <p><strong>Adresas:</strong> ${escapeHtml(data.address)}</p>
          <p><strong>Vertinimo vidurkis:</strong> ${escapeHtml(
            fullName
          )}: ${avgFormatted}</p>
        `;

        const loading = form.querySelector(".loading");
        const errorMsg = form.querySelector(".error-message");
        const sentMsg = form.querySelector(".sent-message");

        if (loading) loading.style.display = "none";
        if (errorMsg) errorMsg.style.display = "none";
        if (sentMsg) {
          sentMsg.style.display = "block";
          sentMsg.textContent =
            "Forma apdorota narsykleje (duomenys neissiunciami i serveri).";
        }

        if (popup) {
          popup.classList.add("show");
          setTimeout(() => {
            popup.classList.remove("show");
          }, 4000);
        }
      },
      true
    );
  });
})();
