# Splot — ustalenia projektu

Data: 9 września 2026 r.  
Status: zakończono pytania dotyczące minimalnej pierwszej wersji. Obowiązuje zakres poniżej. Dokument jest podsumowaniem ustaleń, nie dosłowną transkrypcją.

Szczegółowa instrukcja wykonawcza i plan dalszych faz: [PLAN.md](PLAN.md).

Zatwierdzona nazwa robocza projektu: **Splot**. Nazwa rozszerzenia: **Splot — zapisz i zamknij**. Użytkownik utworzył repozytorium [thigrand/splot](https://github.com/thigrand/splot); adres Git: `https://github.com/thigrand/splot.git`.

Użytkownik używa określenia „Chrome” umownie: celem jest rozszerzenie dla przeglądarek opartych na Chromium, a sam nie korzysta z Google Chrome. Konkretna przeglądarka użytkownika pozostaje do wskazania; będzie podstawowym środowiskiem odbioru. Nie zakładać potwierdzonej zgodności ze wszystkimi przeglądarkami Chromium bez testów.

## 1. Problem i cel

Użytkownik gromadzi wiele otwartych kart: artykuły, filmy YouTube, posty i rolki z Instagrama, Facebooka i LinkedIna oraz internetowe dokumenty. Pierwszy cel to móc zapisać odniesienie do materiału i zamknąć kartę bez utraty linku oraz własnego kontekstu.

Docelowo materiały mają tworzyć rozwijaną bazę wiedzy do nauki i praktycznego wykorzystania, szczególnie w obszarach dzieci i związków. Wartość może wynikać zarówno z informacji, jak i ze sposobu jej przekazania. Grupowanie, synteza, dashboard oraz powtórki należą do dalszych faz.

Zapis URL i metadanych nie jest archiwizacją treści: źródło może później zniknąć lub wymagać logowania. Pierwsza wersja świadomie nie rozwiązuje tego problemu.

## 2. Zatwierdzony zakres pierwszej wersji

| Obszar | Obowiązująca decyzja |
|---|---|
| Interfejs | Rozszerzenie Manifest V3 dla przeglądarek Chromium, z polskim popupem otwieranym ikoną. |
| Pierwsze kliknięcie | Automatycznie tworzy i zapisuje wstępny rekord: pełny URL, domenę, tytuł oraz wartości domyślne. Nie trzeba zatwierdzać formularza, aby zachować sam link. |
| Plik | Automatyczna aktualizacja jednego pliku `agregator/materialy.json` wewnątrz skonfigurowanego folderu pobierania używanej przeglądarki, zwykle `Pobrane`. Mechanizm: rozszerzeniowe API `chrome.downloads`. |
| Pamięć rozszerzenia | Pomocnicza kopia i stan operacji umożliwiające odtworzenie oraz ponowienie zapisu. Nie zastępuje wymaganego pliku. |
| Opis | Opcjonalny. Przy istniejącym URL pokazuje dotychczasowy opis; zatwierdzona wersja zastępuje poprzednią, także pustym tekstem. |
| Tagi | Opcjonalne. Przy ponownym zapisie tego samego URL nowe tagi dołączane są do istniejących; brak duplikatów. |
| Ważność | Dokładnie jedna wartość: `important` — „Jest to dla mnie ważne”, domyślna dla nowego wpisu; `less_important` — „Mniej ważne”. |
| Tryb | Dokładnie jedna wartość `intent`: `remember` — „Zapamiętaj”, domyślna dla nowego wpisu; `summarize` — „Podsumuj”. |
| Duplikat | Identyczny pełny URL aktualizuje ten sam rekord. Tagi tworzą sumę zbiorów; zatwierdzony opis, ważność i tryb zastępują poprzednie. |
| Zatwierdzenie | „Zapisz i zamknij kartę” zatwierdza aktualny formularz, zapisuje obejmującą go migawkę całego zbioru do pliku i zamyka źródłową kartę dopiero po stanie `complete`. Błąd pozostawia kartę otwartą. |
| Rezygnacja | Kliknięcie poza popupem przed zatwierdzeniem odrzuca niezapisane zmiany formularza i pozostawia kartę otwartą. Wstępny rekord pozostaje. Nie ma osobnego „Anuluj”. |
| Wysyłanie danych | Brak konta, backendu i AI. Pierwsza wersja działa lokalnie. |

Kliknięcie „Zapisz i zamknij kartę” jest granicą zatwierdzenia: późniejsze zniknięcie popupu nie cofa operacji już przyjętej przez rozszerzenie. Drobne szczegóły niezawodności, normalizacji danych i bezpieczeństwa zamykania opisuje plan techniczny.

Nie powstają: lista ani strona kolekcji, wyszukiwarka, funkcje edycji i usuwania z listy, ręczny eksport jako sposób pracy, import, pobieranie zaznaczonego tekstu lub pełnej treści, zrzuty ekranu, transkrypcje i multimedia. Uzupełnienie istniejącego URL w popupie pozostaje częścią zatwierdzonego scalania, nie osobnym modułem zarządzania.

## 3. Co oznaczają dwa tryby

| Tryb | Faza 1: lokalny JSON | Docelowy system |
|---|---|---|
| `remember` | Rekord z wybraną intencją; bez wyniku AI. | Materiał trafia do bazy wiedzy i otrzymuje podsumowanie. |
| `summarize` | Również rekord w JSON z wybraną intencją; bez wyniku AI. | Jednorazowe podsumowanie dostępne użytkownikowi, bez wpisu materiału do bazy wiedzy. |

Dane pierwszej fazy służą poznaniu realnych materiałów i intencji. Lokalny zapis `summarize` jest świadomym wymaganiem etapu zbierania; nie oznacza docelowej zgody na trwałe dodanie materiału do bazy wiedzy. Późniejszy import musi zachować tę różnicę. „Zrób research” zostało usunięte z MVP; ewentualny przyszły research wymaga odrębnego projektu, nie trzeciej wartości w obecnym schemacie.

## 4. Znaczenie ważności

`important` oznacza szczególną wartość materiału. Późniejsza synteza ma zachować istotną treść, formę, przykłady i kontekst oraz odróżniać źródło od własnego opracowania.

`less_important` pozwala swobodniej skracać i reorganizować formę, pod warunkiem zachowania sensu. Ważność dla użytkownika nie jest oceną wiarygodności źródła.

Tagi użytkownika i etykiety modelu powinny pozostawać oddzielne. Cel materiału nie jest jego tematem. Baza wiedzy musi zachowywać źródła, różnice i sprzeczności między materiałami.

## 5. Rejestr rozstrzygnięć

| ID | Temat | Wynik |
|---|---|---|
| P1 | Plik JSON | Automatycznie aktualizowany `Pobrane/agregator/materialy.json`; Downloads API, pomocniczy storage. |
| P2 | Powtórzony URL | Jeden rekord, suma tagów, zatwierdzone nowsze wartości opisu / ważności / trybu. |
| P3 | Cele | Dwa rozłączne tryby. Oba rejestrowane w fazie 1, różna docelowa trwałość materiału. |
| P4 | Zawartość | Wyłącznie URL i metadane. Zaznaczony tekst zapisany jako pomysł na później. |
| P5 | Zarządzanie | Tylko zapisujący popup i zamknięcie karty; bez kolekcji i wyszukiwania. |
| P6 | Dalszy system | Telefon, modele, koszty, hosting i format wiedzy odłożone do późniejszych faz; nie blokują lokalnego MVP. |
| P7 | Zamykanie karty | Przycisk zatwierdza i zamyka źródłową kartę dopiero po zapisaniu pliku. |
| P8 | Anulowanie | Klik poza popupem odrzuca tylko niezatwierdzony formularz; wstępny link i karta pozostają. |

Użytkownik preferuje pytania bezpośrednio w rozmowie, pojedynczo, z oczekiwaniem na odpowiedź. Seria pytań do MVP jest zakończona; polecono wrócić do pełnej analizy.

## 6. Dalsze warstwy i pytania

1. **Serwis przetwarzający:** import / przyjęcie danych, pozyskiwanie dozwolonej treści, transkrypcji lub obrazu, jawne błędy dostępu, podsumowanie zgodne z intencją i ważnością.
2. **Baza wiedzy i dashboard:** materiały `remember`, tematy, powiązania, źródła, wersje syntezy oraz osobne wyniki jednorazowego `summarize`. Forma bloga jest pomysłem, nie wymogiem.
3. **Nauka:** powtórki, pytania i ćwiczenia; przypomnienia dopiero po ustaleniu formy, kanału oraz częstotliwości.

Przed uruchomieniem dalszych warstw ustalić: przykłady oczekiwanych wyników, dostawców modeli i budżet, zgodę na wysyłanie danych, retencję tymczasowych treści i wyników, zbieranie z telefonu, hosting oraz kontrolę automatycznego grupowania. Żaden z tych tematów nie rozszerza obecnego MVP.

## 7. Status dokumentacji

Użytkownik poprosił o prompt do implementacji przez Terrę w nowej sesji, a następnie sam utworzył repozytorium [thigrand/splot](https://github.com/thigrand/splot). Prompt znajduje się w [PROMPT_DLA_TERRY.md](PROMPT_DLA_TERRY.md). Odczyt GitHub potwierdził repo, widoczność publiczną i domyślną gałąź `main`. Ta decyzja zastępuje propozycję tworzenia prywatnego repo pod wcześniejszą nazwą. Terra ma wykorzystać istniejące repo bez zmiany widoczności. Trafi do niego kod i dokumentacja projektu, bez rzeczywistego zbioru linków ani sekretów. Podczas przygotowania promptu nie zainicjalizowano lokalnego Git, nie ustawiono `origin` ani nie wykonano pusha.

Wcześniejsze propozycje ręcznego eksportu, autosave formularza, trzech trybów, tablicy celów, zaznaczonego tekstu i strony kolekcji są zastąpione powyższymi ustaleniami. Nie są alternatywnymi instrukcjami wykonawczymi.

Zadanie obejmuje plan i analizę. Nie powstał kod rozszerzenia, nie uruchomiono serwera i nie skonfigurowano AI. [PLAN.md](PLAN.md) jest spójną instrukcją do późniejszego zlecenia implementacji.
