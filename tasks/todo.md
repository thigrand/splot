# Splot — przegląd końcowy planu

- [x] Zebrać wymagania użytkownika pojedynczymi pytaniami.
- [x] Uzgodnić minimalny zakres rozszerzenia.
- [x] Sprawdzić ograniczenia Chrome dotyczące `activeTab`, Downloads API, Storage API, popupu i kart.
- [x] Zapisać ustalenia w `USTALENIA.md`.
- [x] Ujednolicić wykonawczy plan MVP oraz plan dalszych warstw w `PLAN.md`.
- [x] Zweryfikować przykładowy JSON i usunąć odrzucone warianty: ręczny eksport, listę kolekcji, pobieranie treści, zaznaczony tekst i „research”.

## Wynik

Dokumentacja opisuje zatwierdzone MVP: popup rozszerzenia dla Chromium zapisuje URL i metadane do automatycznie nadpisywanego pliku `Pobrane/agregator/materialy.json`, a po potwierdzonym zapisie może zamknąć kartę. Plan zawiera kontrakt JSON, obsługę błędów, wymagane uprawnienia, kroki implementacji i 17 scenariuszy odbioru.

Nie powstał kod rozszerzenia ani nie uruchomiono serwera. Testy produktu są zaplanowane, ale niewykonane — wymagają implementacji i rzeczywistej przeglądarki użytkownika.

## Przekazanie do Terry i GitHub

- [x] Sprawdzić katalog: brak repozytorium Git i skonfigurowanego remota; GitHub CLI nie jest dostępne w PATH.
- [x] Domknąć mechanizm zapisu: Blob w offscreen, koordynacja w workerze, poprawny manifest, odzyskiwanie stanu i odpowiednie testy.
- [x] Dopisać GitHub do zakresu implementacji; istniejące publiczne `thigrand/splot`, bez rzeczywistych zbiorów i sekretów.
- [x] Ujednolicić nazwę roboczą Splot, nazwę rozszerzenia „Splot — zapisz i zamknij” oraz repo `thigrand/splot` w ustaleniach, planie i promptcie.
- [x] Potwierdzić przez GitHub repo utworzone przez użytkownika: `https://github.com/thigrand/splot.git`, widoczność publiczna, domyślna gałąź `main`. Zastąpić tworzenie repo podłączeniem istniejącego remota.
- [x] Poprawić zakres na Chromium; zachować techniczne nazwy API Chrome i wymagać testów w przeglądarce użytkownika.
- [ ] Ustalić konkretną przeglądarkę użytkownika jako podstawowe środowisko odbioru.
- [x] Zapisać oraz sprawdzić prompt dla nowej sesji Terry w PROMPT_DLA_TERRY.md.

Sprawdzenie: przykład kolekcji i pełny przykład manifestu parsują się jako JSON; manifest zawiera wymagane name/version i offscreen. Plan zawiera 17 scenariuszy. Nazwa oraz widoczność repo są zgodne w planie, ustaleniach i promptcie. Dokumentację Chrome Offscreen API zweryfikowano w oficjalnym źródle; testy samego rozszerzenia nadal wymagają implementacji.

Repozytorium GitHub utworzył użytkownik. Przygotowanie lokalnego Git i remota, implementacja, commity i push pozostają pracą do wykonania w nowej sesji.

## Implementacja MVP — 9 września 2026

- [x] Odczytać obowiązujące ustalenia, plan i wnioski.
- [x] Sprawdzić lokalny Git, zdalny `origin` oraz historię `main`; podłączyć katalog bez nadpisywania historii.
- [x] Dodać manifest MV3, model danych oraz testy czystej logiki.
- [x] Zrealizować kolejkę workera, trwały stan i zapis przez dokument offscreen do `agregator/materialy.json`.
- [x] Dodać popup z formularzem oraz bezpieczne zamknięcie właściwej karty po stanie `complete`.
- [x] Napisać instrukcję instalacji, prywatności i ograniczeń.
- [ ] Wykonać testy automatyczne oraz dostępne testy odbioru w wskazanej przeglądarce Chromium.
- [ ] Sprawdzić diff pod kątem danych prywatnych, utworzyć commity i wykonać zwykły push na `main`.

## Wynik implementacji

- Automatyczne testy (`npm test`): 9/9 zaliczonych.
- Parsowanie manifestu i kontrola składni modułów: zaliczone.
- Testy odbioru w przeglądarce użytkownika: oczekują na wskazanie jej nazwy i wersji. Nie wykonano testów na rzeczywistych kartach użytkownika ani w Google Chrome.
