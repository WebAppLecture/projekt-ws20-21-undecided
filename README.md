## [Programmierung und Design von WebApplications mit HTML5, CSS3 und JavaScript](https://lsf.uni-regensburg.de/qisserver/rds?state=verpublish&status=init&vmfile=no&publishid=158883&moduleCall=webInfo&publishConfFile=webInfo&publishSubDir=veranstaltung) ##

SS2020 

Leitung: Dr. Friedrich Wünsch, Louis Ritzkowski

# Minesweeper #

Timo Eisenmann

### Beschreibung ###

Das Spielfeld besteht aus anfangs verdeckten Feldern, welche vom Spieler
aufgedeckt werden können. Einige dieser Felder sind Minen.

Wird eine Mine aufgedeckt, ist das Spiel verloren.
Wird ein Feld aufgedeckt, welches an mindestens eine Mine angrenzt, so zeigt
das Feld fortan die Anzahl der benachbarten Minen an.
Wird ein Feld aufgedeckt, welches an keine Minen angrenzt, werden alle
benachbarten Felder aufgedeckt.

Felder können markiert werden.
Markierte Felder können nicht aufgedeckt werden.

Mithilfe der oberen Leiste kann das Spiel neugestartet werden.
Weiterhin können Form, Breite und Höhe des Spielfelds, sowie Anzahl der Bomben
eingestellt werden.
Die Spielzeit wird ebenfalls angezeigt.

Sind alle Felder, außer den Minen, aufgedeckt, ist das Spiel gewonnen.

### Umsetzung ###

Die Klasse Game steuert das Spiel.
Es verknüpft die Steuerelemente in der oberen Leiste mit dem Spielfeld.

Die Felder sind in einem 'grid' angeordnet und werden dynamisch mit jeder
Änderung der Spielfeldparameter (Form, Höhe, Breite, Minen) erzeugt.

### Steuerung (Falls Spiel) ###

Linke Maustaste: Feld aufdecken.
Rechte Maustaste: Feld markieren.

### Wichtige Klassen/Dateien ###

src/js/game.js: Game

src/js/index.js

src/css/main.css

### Designentscheidungen ###

Ein Feld ist Teil der Ellipse, falls eine gedachte Ellipse über das Spielfeld
mindestens die Hälfte des Felds einschließt.
