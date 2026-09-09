Zaimplementuj pierwszą wersję projektu Splot w bieżącym katalogu i umieść kod w istniejącym repozytorium GitHub `thigrand/splot`: https://github.com/thigrand/splot.git. Nazwa rozszerzenia to „Splot — zapisz i zamknij”. Celem jest gotowe rozszerzenie dla przeglądarek opartych na Chromium, dzięki któremu mogę zapisywać linki i zamykać karty. Nie używam Google Chrome; testy i instrukcję przygotuj dla mojej przeglądarki wskazanej w ustaleniach. Jeśli jej nazwa pozostaje nieustalona, zapytaj o nią jednym pytaniem, kontynuując niezależne prace.

Przeczytaj `USTALENIA.md`, `PLAN.md`, `tasks/lessons.md` oraz `AGENTS.md`, jeśli istnieje. Obowiązują aktualne dokumenty, bez odtwarzania wcześniejszych pomysłów. Zaktualizuj checklistę w `tasks/todo.md`, krótko przedstaw kolejność prac i od razu przejdź do implementacji.

Wymagane zachowanie:
- Kliknięcie ikony tworzy wstępny zapis pełnego URL, domeny, tytułu i wartości domyślnych.
- Formularz ma opcjonalny opis i tagi, ważność `important` / `less_important` oraz jeden `intent`: `remember` / `summarize`. Domyślne wartości to `important` i `remember`. Oba tryby trafiają do JSON; żaden nie uruchamia jeszcze AI.
- Kliknięcie poza popupem odrzuca niezatwierdzony formularz, pozostawia wstępny zapis i nie zamyka karty.
- „Zapisz i zamknij kartę” zatwierdza formularz, aktualizuje `agregator/materialy.json` w folderze pobierania używanej przeglądarki i dopiero po potwierdzonym zapisie zamyka kartę źródłową.
- Duplikaty identycznego URL scalają tagi, a zatwierdzony opis, ważność i intencję zastępują nowszymi wartościami.

Użyj prostego JavaScript, HTML, CSS i Manifest V3 zgodnie z planem. Najpierw doprowadź do działania zapis pliku przez worker i dokument offscreen, następnie dopracuj formularz. Nie dodawaj backendu, AI, researchu, listy materiałów, pobierania treści, importu ani nowych funkcji. Nie uruchamiaj serwera, watchera ani procesu w tle bez mojej wyraźnej zgody.

Najważniejsza jest niezawodność: żadnego zamykania karty przed stanem pobrania `complete`, żadnych równoległych nadpisań i żadnego uzależniania zapisu od otwartego popupu. Obsłuż błędy, ponowienie i restart workera. Po zmianie adresu karty nie zamykaj nowej strony.

Repozytorium `thigrand/splot` zostało już przeze mnie utworzone i jest publiczne. Nie twórz nowego i nie zmieniaj widoczności. Sprawdź lokalny Git, remotes i zdalną historię. Podłącz brakujący `origin` do `https://github.com/thigrand/splot.git`, zachowując obecne pliki i istniejące commity. Użyj gałęzi `main`. Dodaj `.gitignore`, przygotuj commity i wykonaj zwykły push. Repo ma zawierać kod, testy i dokumentację projektu, bez rzeczywistych zbiorów linków, profili przeglądarki, sekretów i plików `.env`. Nie nadpisuj istniejącego repozytorium ani remota wskazującego inny projekt; nie używaj force push. Brak poświadczeń do pusha nie powinien zatrzymywać lokalnej implementacji — wykonaj pozostałą pracę i wskaż konkretny brak.

Przeprowadź testy z planu w rzeczywistej przeglądarce Chromium, której używam, na kontrolowanych kartach testowych. Najpierw potwierdź w niej dostępność wymaganych API, w tym offscreen. Nie używaj do testów moich rzeczywistych kart ani zbioru materiałów. Jeśli testu nie możesz wykonać, zapisz go jako niewykonany i wyjaśnij dlaczego. Testy z atrapami API ani testy wyłącznie w Google Chrome nie dowodzą działania w mojej przeglądarce. Zachowaj techniczne nazwy `chrome.*`; nie zmieniaj ich na `chromium.*` i nie deklaruj zgodności z niesprawdzonymi przeglądarkami.

Pracuj do ukończenia kodu, dostępnych testów i wysłania repo. Nie kończ na szkielecie, propozycji ani liście rzeczy do samodzielnego wykonania. Samodzielnie rozstrzygaj drobne kwestie techniczne; pytaj tylko przy rzeczywistej blokadzie, pojedynczo.

Na końcu podaj link do repozytorium, nazwę i wersję testowanej przeglądarki, wynik testów, ewentualne ograniczenia i krótką instrukcję załadowania folderu `extension` w mojej przeglądarce. Nie publikuj rozszerzenia w żadnym sklepie z dodatkami.
