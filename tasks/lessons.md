# Wnioski ze współpracy

## 2026-09-09 — pytania doprecyzowujące

- Użytkownik chce odpowiadać na pytania bezpośrednio w rozmowie, po jednym.
- Nie wysyłać zestawu pytań ani formularza z wieloma pytaniami. Zadać jedno pytanie w wiadomości, poczekać na odpowiedź, zapisać ustalenie i dopiero wtedy zadać następne.

## 2026-09-09 — cele materiału

- Nie utrzymywać bez uzasadnienia trzech działań z pierwotnego opisu. Użytkownik uprościł produkt do dwóch rozłącznych trybów: „Zapamiętaj” zapisuje materiał i zapewnia podsumowanie, „Podsumuj” tworzy wynik jednorazowy bez zapisywania materiału w bazie.
- Przed projektowaniem schematu odróżniać trwałość materiału od trwałości wyniku. Nie zakładać, że „podsumowanie” samo w sobie oznacza zapis materiału.
- W fazie zbierania zachować również wybór dotyczący przyszłego, jednorazowego wyniku. Brak serwisu nie uzasadnia ukrywania ani blokowania pola `intent`; kolekcjonowanie realnych danych jest celem tej fazy.

## 2026-09-09 — zakres pierwszej wersji

- Pierwsza wersja ma być dowiezionym rozszerzeniem do zapisywania karty i jej zamykania. Nie dodawać listy, wyszukiwarki, edycji, strony kolekcji ani innych funkcji zarządzania.
- Pytania doprecyzowujące prowadzić oszczędnym modelem. Po zakończeniu serii użytkownik chce powrotu do analizy na modelu Astra.

## 2026-09-09 — zmiana modelu rozmowy

- Uruchomienie subagenta Astra nie zmienia modelu głównej rozmowy. Nie przedstawiać delegacji jako przełączenia modelu.
- Potwierdzać zmianę ustawienia dopiero po wyniku odpowiedniego narzędzia. Nie przedstawiać przerwanego przeglądu subagenta jako ukończonej analizy Astra.

## 2026-09-09 — Chromium zamiast Google Chrome

- Użytkownik mówił „Chrome” jako skrót dla ekosystemu rozszerzeń Chromium; sam nie korzysta z Google Chrome.
- Stosować neutralną nazwę repo i dostosować testy oraz instrukcję do faktycznej przeglądarki użytkownika. Zachować prawidłowe techniczne identyfikatory `chrome.*` i `minimum_chrome_version`.
- Nie uznawać zgodności ze wszystkimi przeglądarkami Chromium za potwierdzoną na podstawie dokumentacji lub testów w Google Chrome.
