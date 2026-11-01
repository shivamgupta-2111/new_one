// Base contacts list.

V.contacts = () =>
  `<h1 class="text-xl font-bold mb-3">Contacts</h1>` +
  table(
    ['Name', 'Title', 'Account', 'Email'],
    S.contacts
      .map(
        (c) =>
          `<tr><td><b>${E(c[0])}</b></td><td>${E(c[1])}</td><td>${E(c[2])}</td><td><a style="color:var(--pr)" href="mailto:${E(c[3])}">${E(c[3])}</a></td></tr>`
      )
      .join('')
  );
