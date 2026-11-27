import { neon } from "@neondatabase/serverless";

type TranslationLocale = "en" | "de";

interface ArticleTranslationSeed {
  id: number;
  slug: string;
  translations: Record<
    TranslationLocale,
    {
      title: string;
      summary: string;
      body: string;
    }
  >;
}

interface HistoryTranslationSeed {
  id: number;
  sortOrder: number;
  translations: Record<
    TranslationLocale,
    {
      era_year: string;
      title: string;
      content: string;
      source_citation: string;
    }
  >;
}

interface GalleryTranslationSeed {
  id: number;
  imageUrl: string;
  translations: Record<
    TranslationLocale,
    {
      title: string;
      credit: string;
    }
  >;
}

const ARTICLE_TRANSLATIONS: ArticleTranslationSeed[] = [
  {
    id: 11,
    slug: "dy-vajza-nga-topanica-humben-jeten-ne-aksident-ne-gjermani-28157c46-e019-4e6f-9a05-68ebfd7e043a",
    translations: {
      en: {
        title: "Two Young Women from Topanicë Lose Their Lives in Road Accident in Germany",
        summary:
          "Two 17-year-old girls from Topanicë died in a traffic accident in Germany, deeply grieving the village community.",
        body:
          "According to published reports, two 17-year-old girls, born and raised in Topanicë, lost their lives in a traffic accident on a bus route in Germany. The crash occurred at a hazardous intersection, and German authorities are investigating the exact cause of the incident.\n\nThe news has caused deep sorrow across Topanicë and throughout Kamenicë. Residents, local authorities, and municipal officials have extended their condolences to the victims’ families and organized support for those affected. The tragedy underscores the need for extra caution when young people travel abroad.",
      },
      de: {
        title: "Zwei junge Frauen aus Topanicë kommen bei Verkehrsunfall in Deutschland ums Leben",
        summary:
          "Zwei 17-jährige Mädchen aus Topanicë sind bei einem Verkehrsunfall in Deutschland ums Leben gekommen – das Dorf steht unter Schock.",
        body:
          "Berichten zufolge wurden zwei 17-jährige Mädchen, die in Topanicë geboren und aufgewachsen sind, in Deutschland auf einer Busstrecke in einen schweren Verkehrsunfall verwickelt, bei dem beide ihr Leben verloren. Der Unfall ereignete sich an einer gefährlichen Kreuzung; die deutschen Behörden untersuchen die genaue Ursache.\n\nDie Nachricht hat in der Dorfgemeinschaft von Topanicë sowie in ganz Kamenicë tiefe Trauer ausgelöst. Bewohner, lokale Vertreter und Gemeindeverantwortliche sprachen den Familien ihr Beileid aus und organisierten Hilfe für die Angehörigen. Das Unglück mahnt zu besonderer Vorsicht bei Reisen junger Menschen im Ausland.",
      },
    },
  },
  {
    id: 12,
    slug: "parashikimi-i-motit-per-topanicen-6bd17c11-9551-4ad3-a9f3-062e2c996f1e",
    translations: {
      en: {
        title: "Weather Forecast for Topanicë",
        summary:
          "AccuWeather publishes the upcoming weather outlook for Topanicë, Kamenicë, detailing temperatures, rainfall chances, and wind conditions.",
        body:
          "According to AccuWeather, Topanicë is expected to see average temperatures between 12 and 18°C over the coming week, with mild morning cloudiness giving way to bright midday sunshine. Toward the weekend, northwesterly winds are forecast to strengthen up to 20 km/h, accompanied by a slight chance of evening showers.\n\nThese weather conditions are important for Topanicë residents, particularly for local farming and outdoor work. Moderate temperatures and sunny spells favor vegetable and fruit cultivation, while stronger winds and possible rain call for careful planning in the fields.\n\nResidents are advised to check the forecast regularly when planning travel and daily activities to account for changing weather throughout the week.",
      },
      de: {
        title: "Wettervorhersage für Topanicë",
        summary:
          "AccuWeather veröffentlicht den Wetterausblick für Topanicë, Kamenicë, für die kommenden Tage mit Angaben zu Temperaturen, Niederschlag und Wind.",
        body:
          "Laut AccuWeather erwarten Topanicë in der kommenden Woche durchschnittliche Temperaturen von 12 bis 18 °C, mit leichter Bewölkung am Morgen und hellem Sonnenschein zur Mittagszeit. Gegen Ende der Woche nimmt der Wind aus nordwestlicher Richtung voraussichtlich auf bis zu 20 km/h zu, verbunden mit einer geringen Wahrscheinlichkeit für abendliche Schauer.\n\nDiese Wetterbedingungen sind für die Bewohner von Topanicë insbesondere für die lokale Landwirtschaft und Arbeiten im Freien von Bedeutung. Milde Temperaturen und sonnige Tage begünstigen den Anbau von Gemüse und Obst, während kräftigere Winde und möglicher Regen eine sorgfältige Planung der Feldarbeit erfordern.\n\nDen Bewohnern wird empfohlen, die Vorhersage regelmäßig zu verfolgen, um Fahrten und alltägliche Aktivitäten entsprechend möglicher Wetteränderungen im Wochenverlauf zu planen.",
      },
    },
  },
  {
    id: 13,
    slug: "topanica-dhe-hodonc-deklarohen-zona-te-nxehta-per-perhapjen-e-koronavirusit-ff085df9-a30a-43a4-ba1f-c33822eb901f",
    translations: {
      en: {
        title: "Topanicë and Hodonoc Declared Coronavirus Hotspots",
        summary:
          "Authorities in the Municipality of Kamenicë have identified the villages of Topanicë and Hodonoc as COVID-19 hotspots, urging residents to follow necessary precautions.",
        body:
          "According to a notice issued by local authorities, the villages of Topanicë and Hodonoc have been classified as coronavirus hotspots following a rise in confirmed cases in the area. The assessment is based on recent epidemiological data and aims to prompt swift measures to bring the situation under control.\n\nResidents of Topanicë are advised to observe protective measures, including physical distancing, wearing masks in public spaces, and getting tested promptly if symptoms appear. Authorities are closely monitoring the situation and will introduce additional measures if needed to safeguard public health in the community.",
      },
      de: {
        title: "Topanicë und Hodonoc zu Coronavirus-Hotspots erklärt",
        summary:
          "Die Behörden der Gemeinde Kamenicë haben die Dörfer Topanicë und Hodonoc als Schwerpunkte der Ausbreitung von COVID-19 eingestuft und die Bewohner zu Schutzmaßnahmen aufgerufen.",
        body:
          "Laut einer Mitteilung der lokalen Behörden wurden die Dörfer Topanicë und Hodonoc aufgrund steigender bestätigter Fallzahlen als Coronavirus-Hotspots eingestuft. Diese Bewertung stützt sich auf aktuelle epidemiologische Daten und soll rasche Maßnahmen zur Eindämmung der Lage ermöglichen.\n\nDen Bewohnern von Topanicë wird geraten, Schutzmaßnahmen einzuhalten, darunter Abstandhalten, das Tragen von Masken im öffentlichen Raum sowie regelmäßige Tests bei Symptomen. Die Behörden beobachten die Entwicklung aufmerksam und werden bei Bedarf weitere Schritte einleiten, um die öffentliche Gesundheit in der Gemeinde zu schützen.",
      },
    },
  },
  {
    id: 14,
    slug: "rikthim-i-perpjekjeve-te-hajduteve-ne-topanice-moskaftim-i-sulmit-ne-xhamine-008c7c18-0fa7-445f-ae25-227c7d796328",
    translations: {
      en: {
        title: "Attempted Break-In at the Topanicë Mosque Foiled",
        summary:
          "Police report that thieves attempted to break into the mosque in Topanicë, but the attempt failed amid a string of incidents across villages in Kamenicë.",
        body:
          "Police confirmed that last week thieves attempted to break into the mosque in Topanicë, though the attempt was thwarted thanks to the swift response of residents and local authorities. According to reports, the perpetrators intended to steal valuables from the site, but were caught in the act and fled empty-handed.\n\nThe incident follows a series of similar break-ins in villages across Kamenicë, including the theft of a safe in Shipashnicë and foiled attempts in Rogoqicë. Authorities are continuing their investigation to identify those responsible and strengthen security across local communities.\n\nResidents of Topanicë have called for increased police patrols and the installation of security cameras in public areas to deter similar incidents in the future.",
      },
      de: {
        title: "Einbruchsversuch in die Moschee von Topanicë gescheitert",
        summary:
          "Die Polizei meldet einen gescheiterten Einbruchsversuch in die Moschee von Topanicë im Zuge einer Serie ähnlicher Vorfälle in Dörfern von Kamenicë.",
        body:
          "Die Polizei bestätigte, dass Diebe in der vergangenen Woche versucht haben, in die Moschee von Topanicë einzubrechen. Der Versuch scheiterte jedoch dank des raschen Eingreifens von Bewohnern und lokalen Behörden. Berichten zufolge hatten es die Täter auf Wertgegenstände abgesehen, wurden jedoch auf frischer Tat ertappt und ergriffen ohne Beute die Flucht.\n\nDer Vorfall reiht sich in eine Serie von Einbrüchen in Dörfern der Gemeinde Kamenicë ein, nachdem zuvor ein Tresor in Shipashnicë entwendet worden war und ähnliche Versuche in Rogoqicë scheiterten. Die Ermittlungen zur Identifizierung der Tätergruppe und zur Stärkung der Sicherheit in den Ortschaften dauern an.\n\nDie Bewohner von Topanicë fordern verstärkte Polizeistreifen sowie die Installation von Sicherheitskameras an öffentlichen Plätzen, um künftige Vorfälle zu verhindern.",
      },
    },
  },
  {
    id: 15,
    slug: "komuna-e-kamenices-vazhdon-investimet-ne-topanice-dhe-karaceve-6003c195-90aa-438e-811f-160e68cf5982",
    translations: {
      en: {
        title: "Municipality of Kamenicë Continues Investments in Topanicë and Karaçevë",
        summary:
          "In an official announcement, the Municipality of Kamenicë reported ongoing infrastructure investments in Topanicë as well as Lower and Upper Karaçevë.",
        body:
          "Sh.G | RTKlive\n\nIn an official announcement, the Municipality of Kamenicë stated that infrastructure investments have continued in Topanicë and in Lower and Upper Karaçevë.\n\nIn Topanicë, paving works on three roads have continued, while toward Upper Karaçevë construction has begun on sidewalks and cemetery improvements, with a total investment value of around 317,000 euros.\n\nAccording to the municipality, these projects aim to upgrade local infrastructure and public spaces and create better living conditions for residents.",
      },
      de: {
        title: "Gemeinde Kamenicë setzt Investitionen in Topanicë und Karaçevë fort",
        summary:
          "Die Gemeinde Kamenicë teilte mit, dass die Infrastrukturinvestitionen in Topanicë sowie in Unter- und Ober-Karaçevë fortgesetzt werden.",
        body:
          "Sh.G | RTKlive\n\nWie die Gemeinde Kamenicë in einer Mitteilung bekannt gab, wurden die Infrastrukturinvestitionen in Topanicë sowie in Unter- und Ober-Karaçevë fortgeführt.\n\nIn Topanicë ging die Asphaltierung von drei Straßen weiter, während in Richtung Ober-Karaçevë die Arbeiten am Gehweg und an der Gestaltung des Friedhofs begonnen haben. Der Gesamtwert beläuft sich auf rund 317.000 Euro.\n\nNach Angaben der Gemeinde zielen diese Projekte darauf ab, die Infrastruktur und den öffentlichen Raum zu verbessern und bessere Lebensbedingungen für die Bewohner zu schaffen.",
      },
    },
  },
  {
    id: 16,
    slug: "banor-i-topanices-i-infektuar-me-covid-19-nuk-ka-zbuluar-sakte-informacionin-ne-kufi-4b880a00-31f5-43b1-8f6f-b2a0e9351516",
    translations: {
      en: {
        title: "COVID-19-Infected Topanicë Resident Failed to Disclose Accurate Information at Border",
        summary:
          "A resident originally from Topanicë who tested positive for COVID-19 failed to provide accurate information at border controls and breached testing protocols, according to a QKMF report.",
        body:
          "According to the QKMF report, an individual identified as a resident of Topanicë who had been diagnosed with COVID-19 crossed the border without accurately declaring their contact history or following testing protocols. Border control authorities reported that the person gave inaccurate information and refused to undergo the required test, undermining measures put in place to curb the spread of the virus.\n\nThe incident raised concern within the Topanicë community, where local authorities are encouraging residents to strictly follow health guidelines and report any suspected cases. Health officials emphasized that breaching protocols can have serious public health consequences and urged the individual to cooperate fully to minimize transmission risks.",
      },
      de: {
        title: "Mit COVID-19 infizierter Einwohner von Topanicë machte an der Grenze ungenaue Angaben",
        summary:
          "Ein aus Topanicë stammender, positiv auf COVID-19 getesteter Einwohner machte bei den Grenzkontrollen keine korrekten Angaben und verstieß laut QKMF-Bericht gegen Testvorgaben.",
        body:
          "Laut einem Bericht des QKMF überquerte eine als Einwohner von Topanicë bekannte Person, bei der COVID-19 diagnostiziert worden war, die Grenze, ohne ihre Kontakthistorie wahrheitsgemäß anzugeben und ohne die vorgeschriebenen Testprotokolle einzuhalten. Die Grenzbehörden meldeten, dass die Person falsche Angaben gemacht und den erforderlichen Test verweigert habe, wodurch die Schutzmaßnahmen zur Eindämmung des Virus gefährdet wurden.\n\nDer Vorfall löste in der Dorfgemeinschaft von Topanicë Besorgnis aus. Die lokalen Behörden rufen die Bewohner dazu auf, die Gesundheitsvorgaben strikt zu befolgen und jeden Verdachtsfall zu melden. Zudem betonten sie, dass jeder Verstoß gegen die Vorgaben schwerwiegende Folgen für die öffentliche Gesundheit haben kann, und forderten die betroffene Person zur vollständigen Zusammenarbeit auf.",
      },
    },
  },
  {
    id: 17,
    slug: "mesuesit-e-topanices-ne-konflikt-per-shi-nisin-procedurat-disiplinore-1d7e4d64-d392-4c4c-9fa2-830d8bb4da69",
    translations: {
      en: {
        title: "Dispute Over Rainy-Day Classes Leads to Disciplinary Proceedings for Topanicë Teachers",
        summary:
          "Teachers at the school in Topanicë entered a dispute over holding classes during heavy rain, prompting education authorities to open disciplinary proceedings.",
        body:
          "According to reports, several teachers at the school in Topanicë protested against the decision to hold classes on a day of heavy rainfall, arguing that unsuitable conditions affect the quality of teaching. The dispute escalated, and the school initiated disciplinary proceedings against the teachers involved under education system regulations.\n\nLocal authorities stressed that they will monitor the situation and seek a solution that ensures an appropriate learning environment while respecting the rights of all parties. If the matter remains unresolved, further steps may be taken to keep the school operating in line with established standards.\n\nThe incident has prompted concern in Topanicë, with parents and residents calling for transparency and constructive dialogue to prevent further tensions at the school.",
      },
      de: {
        title: "Konflikt über Unterricht bei Starkregen: Disziplinarverfahren gegen Lehrkräfte in Topanicë",
        summary:
          "Lehrkräfte der Schule in Topanicë gerieten wegen des Unterrichts bei starkem Regen in einen Konflikt, woraufhin die Schulbehörden Disziplinarverfahren einleiteten.",
        body:
          "Berichten zufolge protestierten mehrere Lehrkräfte der Schule in Topanicë gegen die Entscheidung, an einem Tag mit heftigem Regen Unterricht abzuhalten, und argumentierten, die ungeeigneten Bedingungen beeinträchtigten die Qualität des Unterrichts. Der Konflikt eskalierte, sodass die Schulleitung gemäß den Vorschriften des Bildungssystems Disziplinarverfahren gegen die beteiligten Lehrkräfte einleitete.\n\nDie lokalen Behörden betonten, die Lage zu beobachten und nach einer Lösung zu suchen, die ein geeignetes Lernumfeld gewährleistet und die Rechte aller Beteiligten wahrt. Sollte der Konflikt nicht beigelegt werden, könnten weitere Maßnahmen folgen, um den regulären Schulbetrieb sicherzustellen.\n\nIn Topanicë stieß der Vorfall auf Besorgnis; Eltern und Bewohner fordern Transparenz und einen konstruktiven Dialog, um weitere Spannungen an der Schule zu vermeiden.",
      },
    },
  },
  {
    id: 18,
    slug: "rasti-i-pare-i-infektuarit-ne-topanice-ka-kontakte-ne-fshatra-te-tjera-te-kamenices-3b3f06f2-d979-4e51-950a-75d3ca8563ba",
    translations: {
      en: {
        title: "First Confirmed COVID-19 Case in Topanicë Had Contacts in Other Villages of Kamenicë",
        summary:
          "According to Gazeta Express, the first person confirmed with COVID-19 in Topanicë had been in contact with residents of nearby villages in the Municipality of Kamenicë, raising transmission concerns.",
        body:
          "The first person confirmed with COVID-19 in Topanicë, identified by health authorities, had close contact with residents of several neighboring villages in the Municipality of Kamenicë. The finding comes at a critical moment as the community works to contain the spread of the virus in the rural area.\n\nAuthorities immediately launched testing and isolation measures for direct contacts, while organizing awareness campaigns in Topanicë and surrounding villages to promote mask-wearing and social distancing. Residents are urged to report any symptoms and follow health team guidance to reduce the risk of a further wave of infections.",
      },
      de: {
        title: "Erster COVID-19-Fall in Topanicë hatte Kontakte in weiteren Dörfern von Kamenicë",
        summary:
          "Laut Gazeta Express stand die erste in Topanicë bestätigte mit COVID-19 infizierte Person in Kontakt mit Bewohnern anderer Dörfer in der Gemeinde Kamenicë, was das Ausbreitungsrisiko erhöht.",
        body:
          "Die erste in Topanicë von den Gesundheitsbehörden bestätigte mit COVID-19 infizierte Person hatte engen Kontakt zu Bewohnern mehrerer Nachbardörfer in der Gemeinde Kamenicë. Diese Erkenntnis fällt in eine kritische Phase, in der die Gemeinschaft versucht, die Ausbreitung der Krankheit im ländlichen Raum einzudämmen.\n\nDie Behörden leiteten umgehend Tests und Isolationsmaßnahmen für direkte Kontaktpersonen ein und starteten Informationskampagnen in Topanicë sowie in den umliegenden Dörfern, um zum Tragen von Masken und zum Abstandhalten zu ermutigen. Die Bewohner werden gebeten, jedes Symptom zu melden und den Anweisungen der Gesundheitsteams zu folgen, um das Risiko einer neuen Infektionswelle zu minimieren.",
      },
    },
  },
  {
    id: 19,
    slug: "komuna-e-kamenices-vazhdon-investimet-ne-infrastrukturen-e-topanices-cc64af27-725b-4668-8753-fa4a175db6d7",
    translations: {
      en: {
        title: "Municipality of Kamenicë Continues Infrastructure Investments in Topanicë",
        summary:
          "The Municipality of Kamenicë is carrying out ongoing road paving and upgrade works in Topanicë, according to Mayor Kadri Rahimaj.",
        body:
          "According to a report published by Redaksia Rajonipress, Mayor Kadri Rahimaj visited the site and emphasized that road infrastructure projects in Topanicë are progressing steadily. The works include paving main roads and upgrading public spaces to ease traffic flow and improve safety for residents.\n\nThese investments form part of a broader municipal development program for outlying areas, aimed at improving road connections and supporting local economic growth. Residents of Topanicë stand to benefit from better infrastructure that eases daily travel and enhances quality of life in the village.",
      },
      de: {
        title: "Gemeinde Kamenicë setzt Infrastrukturinvestitionen in Topanicë fort",
        summary:
          "Laut Aussagen von Bürgermeister Kadri Rahimaj führt die Gemeinde Kamenicë laufende Asphaltierungs- und Straßenausbauarbeiten in Topanicë durch.",
        body:
          "Wie die Redaktion Rajonipress berichtete, besuchte Bürgermeister Kadri Rahimaj die Baustelle und betonte, dass die Straßeninfrastrukturprojekte in Topanicë zügig voranschreiten. Die Arbeiten umfassen die Asphaltierung der Hauptstraßen sowie die Aufwertung öffentlicher Räume, um den Verkehr zu entlasten und die Sicherheit der Bewohner zu erhöhen.\n\nDiese Investitionen sind Teil eines umfassenderen Entwicklungsprogramms für die Außenbereiche der Gemeinde, das auf bessere Verkehrsanbindungen und die Förderung der lokalen Wirtschaft abzielt. Die Bewohner von Topanicë profitieren von einer moderneren Infrastruktur, die den täglichen Verkehr erleichtert und zur Steigerung der Lebensqualität im Dorf beiträgt.",
      },
    },
  },
  {
    id: 20,
    slug: "asfaltimi-i-18-rrugeve-ne-topanice-investim-prej-347-mije-eurosh-26f9666c-3de7-40ce-be11-c3cb22dd0b2c",
    translations: {
      en: {
        title: "Paving of 18 Roads in Topanicë: A 347,000-Euro Investment",
        summary:
          "The Municipality of Kamenicë has allocated 347,000 euros for paving 18 roads in Topanicë, drawing varied reactions from residents.",
        body:
          "According to a post by Mayor Kadri Rahimaj, a budget of 347,000 euros has been allocated to pave 18 roads in Topanicë. Works began last month and are expected to be completed within six months, aiming to improve the village’s links to the municipality’s main road network.\n\nReactions on social media have been mixed: some residents welcome the infrastructure upgrades and smoother travel, while others urge that similar investments also reach other villages in the municipality. Local officials emphasized that the project is part of a wider municipal plan to upgrade roads across Kamenicë.\n\nFor further details on project phases and completion dates, residents can contact the Municipality of Kamenicë office or follow updates on the official municipal website.",
      },
      de: {
        title: "Asphaltierung von 18 Straßen in Topanicë: Investition von 347.000 Euro",
        summary:
          "Die Gemeinde Kamenicë investiert 347.000 Euro in die Asphaltierung von 18 Straßen in Topanicë – das Projekt stößt auf unterschiedliche Reaktionen in der Bevölkerung.",
        body:
          "Laut einem Beitrag von Bürgermeister Kadri Rahimaj wurde für die Asphaltierung von 18 Straßen in Topanicë ein Budget von 347.000 Euro bereitgestellt. Die Bauarbeiten begannen im vergangenen Monat und sollen innerhalb von sechs Monaten abgeschlossen sein, um die Anbindung des Dorfes an die Hauptverkehrsstraßen der Gemeinde zu verbessern.\n\nIn den sozialen Medien fallen die Reaktionen geteilt aus: Einige Bewohner begrüßen die Modernisierung der Infrastruktur und die Erleichterung im Alltag, während andere fordern, auch in weitere Dörfer der Gemeinde zu investieren. Die lokalen Behörden betonten, dass das Projekt Teil eines umfassenden Entwicklungsplans für den Straßenbau in der gesamten Gemeinde ist.\n\nWeitere Einzelheiten zu den Bauphasen und Fertigstellungsterminen erhalten die Bewohner beim Gemeindeamt Kamenicë oder über die offizielle Website der Gemeinde.",
      },
    },
  },
  {
    id: 21,
    slug: "njeriu-50-vjecar-i-topanices-humbet-jeten-ne-aksident-rrugor-ff95f749-4e42-4a49-833c-4fe909c4bb9c",
    translations: {
      en: {
        title: "50-Year-Old Man from Topanicë Loses Life in Road Accident",
        summary:
          "A 50-year-old man from Topanicë died following a car crash on a local road, according to local media reports.",
        body:
          "According to information published by KOHA.net, a 50-year-old resident of Topanicë lost his life in a car accident on the road connecting the village with surrounding areas. The collision occurred in the morning hours when his vehicle struck another car, causing severe damage and resulting in the victim’s death at the scene.\n\nLocal authorities were notified and are investigating to determine the exact cause of the crash. The victim’s family has been informed and received support from the Topanicë community, which gathered to offer condolences and assist with funeral arrangements.\n\nThe tragedy has shaken the close-knit community of Topanicë, prompting renewed calls to improve road safety in the area and prevent similar accidents in the future.",
      },
      de: {
        title: "50-jähriger Mann aus Topanicë stirbt bei Verkehrsunfall",
        summary:
          "Ein 50-jähriger Mann aus Topanicë ist nach einem Autounfall auf einer Verbindungsstraße ums Leben gekommen, wie lokale Medien berichten.",
        body:
          "Nach Angaben von KOHA.net kam ein 50-jähriger Bewohner von Topanicë bei einem Autounfall auf der Straße ums Leben, die das Dorf mit der Umgebung verbindet. Der Unfall ereignete sich am Morgen, als sein Fahrzeug mit einem anderen Auto zusammenstieß; die schweren Folgen führten noch am Unfallort zum Tod des Mannes.\n\nDie örtlichen Behörden wurden verständigt und ermitteln zur genauen Unfallursache. Die Familie des Verstorbenen wurde benachrichtigt und erhielt Rückhalt aus der Dorfgemeinschaft von Topanicë, die zusammenkam, um ihr Beileid auszusprechen und bei der Organisation der Beerdigung zu helfen.\n\nDiese Tragödie hat die kleine Gemeinschaft von Topanicë tief erschüttert und Forderungen nach mehr Verkehrssicherheit und Präventionsmaßnahmen in der Region laut werden lassen.",
      },
    },
  },
  {
    id: 22,
    slug: "banoret-e-topanices-kunder-transferimit-te-nxenesve-a09c1e36-2e23-485d-9112-b89258ce6856",
    translations: {
      en: {
        title: "Residents of Topanicë Oppose Transfer of Students",
        summary:
          "Residents of Topanicë voiced opposition to the municipality’s plan to transfer students to another school, citing concerns over access to education and transportation.",
        body:
          "According to reports, residents of Topanicë held a meeting at the local school where they criticized the proposed decision to transfer students to another institution outside the village. They argue that such a move would create transportation difficulties, disrupt social ties, and negatively affect the quality of learning.\n\nMunicipal authorities responded by stating that the decision forms part of a broader program to improve school infrastructure and balance classroom capacities. However, residents are calling for open dialogue and consideration of alternatives before any changes are implemented.",
      },
      de: {
        title: "Bewohner von Topanicë lehnen Verlegung der Schülerinnen und Schüler ab",
        summary:
          "Die Bewohner von Topanicë sprechen sich gegen den Plan der Gemeinde aus, Schülerinnen und Schüler an eine andere Schule zu verlegen, und verweisen auf Bedenken bei Schulweg und Bildung.",
        body:
          "Berichten zufolge organisierten die Bewohner von Topanicë eine Versammlung an der örtlichen Schule, bei der sie den vorgeschlagenen Beschluss kritisierten, Schülerinnen und Schüler an eine Einrichtung außerhalb des Dorfes zu verlegen. Sie argumentieren, dieser Schritt führe zu Transportschwierigkeiten, dem Verlust sozialer Bindungen und negativen Auswirkungen auf die Unterrichtsqualität.\n\nDie Gemeindebehörden erklärten ihrerseits, die Maßnahme sei Teil eines größeren Programms zur Verbesserung der Schulinfrastruktur und zum Ausgleich der Kapazitäten. Die Bewohner fordern jedoch einen offenen Dialog und die Prüfung von Alternativen, bevor weitere Schritte umgesetzt werden.",
      },
    },
  },
  {
    id: 23,
    slug: "topanica-ne-listen-lista-per-familjen-besojme-se-do-ta-kalojme-pragun-2cb6b2ab-1e4e-4a23-9e8e-19800aa113a9",
    translations: {
      en: {
        title: "Topanicë on the “Lista për Familjen” Ticket: “We Believe We Will Cross the Threshold”",
        summary:
          "A representative from Topanicë stated that the village’s participation on the “Lista për Familjen” political slate brings hope for progress and improved living conditions for residents.",
        body:
          "During a meeting organized by “Lista për Familjen”, the representative from Topanicë emphasized that the village needs renewed support in infrastructure, education, and healthcare. He expressed confidence that by participating in this political platform, Topanicë will overcome current challenges and achieve tangible results for the community.\n\nIn his remarks, he underscored the importance of cooperation between residents and the party, encouraging everyone to contribute to upcoming initiatives. According to him, “Lista për Familjen” aims to bring investments in roads, water supply, and cultural activities that will improve everyday life in Topanicë.",
      },
      de: {
        title: "Topanicë auf der Liste „Lista për Familjen“: „Wir glauben, dass wir die Hürde schaffen“",
        summary:
          "Ein Vertreter aus Topanicë erklärte, die Beteiligung des Dorfes an der politischen Liste „Lista për Familjen“ wecke Hoffnung auf Fortschritt und bessere Lebensbedingungen.",
        body:
          "Bei einer von „Lista për Familjen“ organisierten Zusammenkunft betonte der Vertreter aus Topanicë, dass das Dorf neue Unterstützung in den Bereichen Infrastruktur, Bildung und Gesundheitswesen benötige. Er zeigte sich zuversichtlich, dass Topanicë durch die Einbindung in diese politische Plattform bestehende Hürden überwinden und konkrete Ergebnisse für die Gemeinschaft erzielen könne.\n\nIn seiner Ansprache hob er die Bedeutung der Zusammenarbeit zwischen Bewohnern und Partei hervor und ermutigte alle, sich an künftigen Projekten zu beteiligen. Seinen Angaben zufolge strebt „Lista për Familjen“ Investitionen in Straßen, Wasserversorgung und kulturelle Aktivitäten an, die den Alltag der Menschen in Topanicë verbessern sollen.",
      },
    },
  },
  {
    id: 24,
    slug: "topanica-refuzon-reformen-arsimore-ne-kamenice-6309f1f3-201c-46bd-952b-3f350f72c2a2",
    translations: {
      en: {
        title: "Topanicë Rejects Education Reform in Kamenicë",
        summary:
          "The villages of Topanicë and Koretin have rejected the education reform proposed by the Municipality of Kamenicë, raising concerns over its impact on local schools and teaching.",
        body:
          "The villages of Topanicë and Koretin, in the Municipality of Kamenicë, have taken a joint stance in rejecting the implementation of the new education reform proposed by the municipality. Residents of both villages expressed concern that the proposed changes could negatively affect the organization of local schools and the quality of instruction for students.\n\nMunicipal authorities underscored the importance of the reform for improving the education system across the municipality, while agreeing to hold meetings with village representatives to discuss concerns and seek shared solutions. Talks are expected to continue in the coming weeks with the aim of reaching a compromise that meets both community needs and reform goals.",
      },
      de: {
        title: "Topanicë lehnt Bildungsreform in Kamenicë ab",
        summary:
          "Die Dörfer Topanicë und Koretin haben die von der Gemeinde Kamenicë vorgeschlagene Bildungsreform abgelehnt und äußern Sorge um die lokalen Schulen und den Unterricht.",
        body:
          "Die Dörfer Topanicë und Koretin in der Gemeinde Kamenicë haben gemeinsam die Umsetzung der von der Gemeinde vorgeschlagenen neuen Bildungsreform abgelehnt. Die Bewohner beider Dörfer äußerten die Befürchtung, die geplanten Veränderungen könnten die Organisation der örtlichen Schulen und die Unterrichtsqualität für die Schülerinnen und Schüler beeinträchtigen.\n\nDie Gemeindebehörden betonten zwar die Bedeutung der Reform für die Verbesserung des Bildungssystems in der gesamten Gemeinde, erklärten sich jedoch bereit, Gespräche mit Dorfvertretern zu führen, um Bedenken zu erörtern und gemeinsame Lösungen zu suchen. Der Dialog soll in den kommenden Wochen fortgesetzt werden, mit dem Ziel eines Kompromisses, der sowohl den Bedürfnissen der lokalen Gemeinschaften als auch den Zielen der Reform gerecht wird.",
      },
    },
  },
];

const HISTORY_TRANSLATIONS: HistoryTranslationSeed[] = [
  {
    id: 1,
    sortOrder: 0,
    translations: {
      en: {
        era_year: "Location",
        title: "Topanicë in Anamorava",
        content:
          "The village of Topanicë is located in the Municipality of Kamenicë (Dardanë), in the Gjilan Region, on the Anamorava plain. The reference coordinates given for the center of the settlement are 42°31′46″N 21°37′35″E.",
        source_citation: "Reference coordinates of the settlement",
      },
      de: {
        era_year: "Lage",
        title: "Topanicë in Anamorava",
        content:
          "Das Dorf Topanicë liegt in der Gemeinde Kamenicë (Dardanë), in der Region Gjilan, in der Ebene von Anamorava. Die angegebenen Koordinaten für das Ortszentrum lauten 42°31′46″N 21°37′35″E.",
        source_citation: "Orientierungskoordinaten der Ortschaft",
      },
    },
  },
  {
    id: 2,
    sortOrder: 1,
    translations: {
      en: {
        era_year: "Late Antiquity",
        title: "The Multi-Layered Settlement of Topanicë",
        content:
          "The Cultural Heritage Register includes the multi-layered settlement of Topanicë on the list for permanent protection (unique no. 1197). The Cultural Heritage Database records the site at Gradec as a Late Antiquity fortress and describes surface finds and archaeological test trenches.",
        source_citation: "Cultural Heritage Register, unique no. 1197; Cultural Heritage Database, site 3904",
      },
      de: {
        era_year: "Spätantike",
        title: "Die mehrschichtige Siedlung von Topanicë",
        content:
          "Das Register des Kulturerbes führt die mehrschichtige Siedlung von Topanicë auf der Liste für dauerhaften Schutz (eindeutige Nr. 1197). Die Datenbank des Kulturerbes verzeichnet die Stätte in Gradec als spätantike Festung und beschreibt Oberflächenfunde sowie archäologische Sondierungen.",
        source_citation: "Register des Kulturerbes, Nr. 1197; Datenbank des Kulturerbes, Objekt 3904",
      },
    },
  },
  {
    id: 8,
    sortOrder: 2,
    translations: {
      en: {
        era_year: "4 February 1910",
        title: "Bajram Beg Curri in Topanicë",
        content:
          "**4 February 1910 – Assembly in Muçivërc:**\n- On 4 February 1910, at the home of Avdi Aga in Muçivërc, a historic assembly was held under the leadership of chairman Shemë Dajkoci.\n- Around 120–150 men and prominent patriots from across the region took part in the assembly.\n\n**Purpose of the assembly:**\n- Preparing the men for steadfastness and armed resistance against the Young Turk occupiers.\n- Organizing a popular movement to raise the national flag in Skopje.\n- Hasan Prishtina had been arrested and sent to prison in Belgrade, while Russian forces prevented the raising of the flag in Skopje.\n\n**Participants from Topanicë:**\n- Asllan Topanica (son of Tahir)\n- Bajram Bani\n- Cenë Veseli\n\n**4 February 1910 – Overnight stay in Topanicë:**\n- Following the assembly, Bajram Beg Curri was escorted to Topanicë by order of Emin Blalata, with Ajet Blalata guaranteeing his safety.\n- On 4 February 1910, Bajram Beg Curri spent the night in the home and hospitable *oda* of Bajram Bani in Topanicë.\n\n**Departure toward Novobërdë:**\n- Bajram Beg Curri asked Cenë Veseli of Topanicë to go to Koretin to invite two merchants, Emin Cana and Shefki Avdyli.\n- The next morning, properly equipped and prepared, they set out toward the Novobërdë Fortress, where insurgents from Novobërdë and Gjilan were awaiting them.\n\n**Historical route:**\n- Kamenicë → Hogosht → Muçivërc → Topanicë → Koretin → Novobërdë",
        source_citation: "Historical testimonies and village memory",
      },
      de: {
        era_year: "4. Februar 1910",
        title: "Bajram Beg Curri in Topanicë",
        content:
          "**4. Februar 1910 – Versammlung in Muçivërc:**\n- Am 4. Februar 1910 fand im Haus von Avdi Aga in Muçivërc unter dem Vorsitz von Shemë Dajkoci eine historische Versammlung statt.\n- An der Versammlung nahmen rund 120–150 Männer und angesehene Patrioten aus der gesamten Region teil.\n\n**Ziel der Versammlung:**\n- Vorbereitung der Männer auf Standhaftigkeit und bewaffneten Widerstand gegen die jungtürkischen Besatzer.\n- Organisierung einer Volksbewegung zum Hissen der Nationalflagge in Skopje.\n- Hasan Prishtina war verhaftet und in das Gefängnis von Belgrad gebracht worden, während russische Kräfte das Hissen der Flagge in Skopje verhinderten.\n\n**Teilnehmer aus Topanicë:**\n- Asllan Topanica (Sohn des Tahir)\n- Bajram Bani\n- Cenë Veseli\n\n**4. Februar 1910 – Übernachtung in Topanicë:**\n- Nach dem Ende der Versammlung wurde Bajram Beg Curri auf Anordnung von Emin Blalata nach Topanicë geleitet, wobei Ajet Blalata für seine Sicherheit bürgte.\n- Am 4. Februar 1910 übernachtete Bajram Beg Curri im Haus und in der gastfreundlichen *Oda* von Bajram Bani in Topanicë.\n\n**Aufbruch nach Novobërdë:**\n- Bajram Beg Curri bat Cenë Veseli aus Topanicë, nach Koretin zu gehen, um die beiden Kaufleute Emin Cana und Shefki Avdyli einzuladen.\n- Am nächsten Tag brachen sie mit der nötigen Ausrüstung und Vorbereitung zur Festung von Novobërdë auf, wo Aufständische aus Novobërdë und Gjilan auf sie warteten.\n\n**Historische Route:**\n- Kamenicë → Hogosht → Muçivërc → Topanicë → Koretin → Novobërdë",
        source_citation: "Historische Zeugnisse und Dorferinnerung",
      },
    },
  },
  {
    id: 9,
    sortOrder: 3,
    translations: {
      en: {
        era_year: "1910–1956",
        title: "Asllan Topanica (i Tahirit)",
        content:
          "*Asllan means lion.* This noble, wise, dignified, and calm yet warmhearted man became a lion whenever the homeland was at stake: courageous with the rifle, the spoken word, and the pen.\n\n**4 February 1910 – The Muçivërc Assembly:**\n- Asllan Topanica took part in the Muçivërc Assembly, held on 4 February 1910 at the home of Avdi Agë Muçivërci under the leadership of Shemë Daikoci.\n- The assembly convened with Bajram Curri and over 120 men, resolving to resist and fight for liberation from the Young Turks and the declaration of independence alongside Hasan Prishtina in Skopje.\n\n**1941–1944 – Mayor of the Municipality of Ropotovë:**\n- Asllan Topanica served as Mayor of the Municipality of Ropotovë during the period of Free Albania (1941–1944).\n- The municipality’s territory encompassed the villages of Perlepnicë, Kmetovc, Topanicë, Koretin, and Berivojcë.\n\n**13 November 1944 – The Rogana Assembly:**\n- He attended the Rogana Assembly, held on 13 November 1944 in the *oda* of Sulejman Ibrahim Kallaba.\n- The assembly was chaired by Myderris Haki and Mulla Idriz Gjilani (Velekinca).\n- Participants included the Mayor of Hogosht, Osmon Aga; representatives of Rogana; Sylë Daikoci of Ropotovë; Asllan Topanica; and Mehmet Topanica.\n\n**February 1956 – The Weapons Campaign under Ranković:**\n- During the brutal weapons confiscation campaign in February 1956 under the Ranković regime, Topanicë was placed under military and police siege.\n- Police forces stationed themselves in a village *oda* and demanded that the village elders hand over 10 rifles, promising they would not be beaten.\n- After the village deliberated, *mixha* Asllan spoke openly: *“Men, these people cannot be trusted. If they ask us where the weapons are and where we got them, I would not say. Whatever they intend to do, let them do it; I will not single out my fellow villagers.”*\n- Following this heroic refusal to endanger his fellow villagers, severe beatings and mistreatment began inside the village school.",
        source_citation: "Oral history and village testimonies",
      },
      de: {
        era_year: "1910–1956",
        title: "Asllan Topanica (i Tahirit)",
        content:
          "*Asllan bedeutet Löwe.* Dieser edle, weise, würdevolle und ruhige, zugleich herzliche Mann wurde zum Löwen, wenn es um die Heimat ging: mutig mit dem Gewehr, dem Wort und der Feder.\n\n**4. Februar 1910 – Die Versammlung von Muçivërc:**\n- Asllan Topanica nahm an der Versammlung von Muçivërc teil, die am 4. Februar 1910 im Haus von Avdi Agë Muçivërci unter der Leitung von Shemë Daikoci stattfand.\n- Die Versammlung tagte im Beisein von Bajram Curri und über 120 Männern und beschloss den Widerstand sowie den Kampf für die Befreiung von den Jungtürken und die Ausrufung der Unabhängigkeit gemeinsam mit Hasan Prishtina in Skopje.\n\n**1941–1944 – Bürgermeister der Gemeinde Ropotovë:**\n- Asllan Topanica diente während der Zeit des Freien Albaniens (1941–1944) als Bürgermeister der Gemeinde Ropotovë.\n- Das Gebiet dieser Gemeinde umfasste die Dörfer Perlepnicë, Kmetovc, Topanicë, Koretin und Berivojcë.\n\n**13. November 1944 – Die Versammlung von Rogana:**\n- Er nahm an der Versammlung von Rogana teil, die am 13. November 1944 in der *Oda* von Sulejman Ibrahim Kallaba stattfand.\n- Die Versammlung wurde von Müderris Haki und Mulla Idriz Gjilani (Velekinca) geleitet.\n- Teilgenommen haben der Bürgermeister von Hogosht, Osmon Aga, Vertreter aus Rogana, Sylë Daikoci aus Ropotovë sowie Asllan Topanica und Mehmet Topanica.\n\n**Februar 1956 – Die Waffenaktion unter Ranković:**\n- Während der brutalen Waffenbeschlagnahmungsaktion im Februar 1956 unter dem Ranković-Regime wurde Topanicë von Militär und Polizei abgeriegelt.\n- Polizeikräfte richteten sich in einer *Oda* des Dorfes ein und forderten von den Dorfältesten die Herausgabe von zehn Gewehren, mit dem Versprechen, sie würden nicht geschlagen.\n- Nach gemeinsamer Beratung des Dorfes sprach *Mixha* Asllan offen: *„Männer, diesen Leuten kann man nicht trauen. Wenn sie uns fragen, wo die Waffen sind und woher wir sie haben, würde ich es nicht sagen. Was auch immer sie vorhaben, sollen sie es tun; ich werde meine Dorfbewohner nicht preisgeben.“*\n- Nach dieser mutigen Weigerung, seine Mitbewohner preiszugeben, begannen schwere Misshandlungen in der Dorfschule.",
        source_citation: "Mündliche Überlieferung und Zeugnisse des Dorfes",
      },
    },
  },
  {
    id: 10,
    sortOrder: 4,
    translations: {
      en: {
        era_year: "Old Crafts",
        title: "Hasan’s Barbershop — Berber Hasani",
        content:
          "In the old days, barbers worked with only scissors and a comb, yet got every job done. There were no elaborate styles—mostly shaving or trimming hair for older men, while the haircut was the same for everyone, with the hair across the forehead parted neatly in a straight line.\n\nHasan Brica, as he was called back then, was a true master of his craft. He was known for his good humor and warm hospitality, especially toward the children waiting their turn—even if every haircut came out uniform and identical.\n\nLater came manual hand-cranked clippers with a comb, before electric tools ever arrived. Waiting times grew longest ahead of holidays and especially for Bajram, when the line outside the barbershop stretched long. Berber Hasani remains a respected name in the collective memory of Topanicë.",
        source_citation: "Topanicë community memory",
      },
      de: {
        era_year: "Alte Handwerke",
        title: "Hasans Barbierstube — Berber Hasani",
        content:
          "Früher hatten Barbiere als Werkzeug nur Schere und Kamm und erledigten damit ihre gesamte Arbeit. Besondere Frisuren gab es kaum, abgesehen vom Rasieren oder Kürzen der Haare bei älteren Männern; der Haarschnitt war für alle gleich, und das Haar vorne an der Stirn wurde mit einem geraden Scheitel gekämmt.\n\nHasan Brica, wie er damals genannt wurde, war ein wahrer Meister seiner Zeit. Er war bekannt für seinen guten Humor und seine Gastfreundschaft, besonders gegenüber den Kindern, die in der Reihe warteten – auch wenn jeder Schnitt einheitlich ausfiel.\n\nSpäter kam die manuelle Handhaarschneidemaschine mit Kamm hinzu, noch ohne elektrischen Antrieb. Besonders vor Feiertagen und vor allem zu Bajram wurden die Wartezeiten lang, wenn sich vor der Barbierstube eine große Schlange bildete. Berber Hasani bleibt ein geachteter Name in der Erinnerung von Topanicë.",
        source_citation: "Gemeinschaftserinnerung von Topanicë",
      },
    },
  },
  {
    id: 3,
    sortOrder: 5,
    translations: {
      en: {
        era_year: "2011",
        title: "Population Census",
        content:
          "The 2011 population census recorded 2,061 residents in Topanicë. This figure belongs to that census and does not represent today’s population.",
        source_citation: "Municipality of Kamenicë, data from the Kosovo Agency of Statistics",
      },
      de: {
        era_year: "2011",
        title: "Volkszählung",
        content:
          "Bei der Volkszählung im Jahr 2011 wurden in Topanicë 2.061 Einwohner gezählt. Diese Zahl bezieht sich auf jene Erhebung und beschreibt nicht die heutige Bevölkerung.",
        source_citation: "Gemeinde Kamenicë, Daten der Statistikbehörde des Kosovo",
      },
    },
  },
  {
    id: 4,
    sortOrder: 6,
    translations: {
      en: {
        era_year: "2024",
        title: "Population Census",
        content:
          "The 2024 census counted 1,286 residents in Topanicë. Settlement-level population data are published by the Kosovo Agency of Statistics (ASK).",
        source_citation: "ASK, Population of the Municipality of Kamenicë by Settlement and Gender, 2011 and 2024",
      },
      de: {
        era_year: "2024",
        title: "Volkszählung",
        content:
          "Die Volkszählung von 2024 ergab 1.286 Einwohner in Topanicë. Die Bevölkerungsdaten nach Ortschaften werden von der Statistikbehörde des Kosovo (ASK) veröffentlicht.",
        source_citation: "ASK, Bevölkerung der Gemeinde Kamenicë nach Ortschaft und Geschlecht, 2011 und 2024",
      },
    },
  },
  {
    id: 5,
    sortOrder: 7,
    translations: {
      en: {
        era_year: "Community Memory",
        title: "Lisi i Kungullarit",
        content:
          "In a 2025 interview, a representative of the Topanica Association identifies the solitary oak tree in the association’s logo as “Lisi i Kungullarit”. According to his account, the oak is over 100 years old and has stood alone with no other trees nearby. Its age is an estimate passed down by the community in the interview and is not presented as a scientific measurement.",
        source_citation: "Interview with the Chair of the Topanica Association, SAM24.info, 30 May 2025",
      },
      de: {
        era_year: "Gemeinschaftserinnerung",
        title: "Lisi i Kungullarit",
        content:
          "In einem Interview aus dem Jahr 2025 bezeichnet der Vertreter des Vereins Topanica die einsame Eiche im Vereinslogo als „Lisi i Kungullarit“. Nach seiner Erzählung ist die Eiche über 100 Jahre alt und stand allein, ohne andere Bäume in der Nähe. Diese Altersangabe ist eine von der Gemeinschaft überlieferte Einschätzung und stellt keine wissenschaftliche Messung dar.",
        source_citation: "Interview mit dem Vorsitzenden des Vereins Topanica, SAM24.info, 30. Mai 2025",
      },
    },
  },
  {
    id: 6,
    sortOrder: 8,
    translations: {
      en: {
        era_year: "Community Memory",
        title: "Mëhallët and Lagjja e Epërme",
        content:
          "The names and stories of the village quarters (mëhallët) still need to be collected from residents. The interview with the Topanica Association mentions “Lagjja e Epërme” (Upper Quarter), associated with families who arrived from the highlands of Kamenicë (Malësia e Kamenicës). That is one name documented in this account; the full list of the village’s quarters remains to be completed and verified together with the community.",
        source_citation: "Interview with the Chair of the Topanica Association, SAM24.info, 30 May 2025",
      },
      de: {
        era_year: "Gemeinschaftserinnerung",
        title: "Mëhallët und Lagjja e Epërme",
        content:
          "Die Namen und Geschichten der Dorfteile (Mëhallët) müssen gemeinsam mit den Bewohnern gesammelt werden. Im Interview des Vereins Topanica wird „Lagjja e Epërme“ (Oberes Viertel) erwähnt, verbunden mit Familien aus dem Hochland von Kamenicë (Malësia e Kamenicës). Dies ist ein in jenem Bericht dokumentierter Name; die vollständige Liste der Dorfteile bleibt gemeinsam mit der Gemeinschaft zu ergänzen und zu überprüfen.",
        source_citation: "Interview mit dem Vorsitzenden des Vereins Topanica, SAM24.info, 30. Mai 2025",
      },
    },
  },
  {
    id: 7,
    sortOrder: 9,
    translations: {
      en: {
        era_year: "Education",
        title: "SHFMU “Rexhep Mala”",
        content:
          "The Topanica Association notes its support for education at the village school, SHFMU “Rexhep Mala”. In the archival polling center list of the Central Election Commission (KQZ) for Topanicë, the school appears under the spelling “Rexhep Malaj”.",
        source_citation: "Topanica Association Interview, SAM24.info, 30 May 2025; KQZ, Polling Centers 2014",
      },
      de: {
        era_year: "Bildung",
        title: "SHFMU „Rexhep Mala“",
        content:
          "Der Verein Topanica verweist auf die Unterstützung der Bildung an der Dorfschule SHFMU „Rexhep Mala“. In der archivierten Wahllokalliste der Zentralen Wahlkommission (KQZ) für Topanicë ist die Schule unter der Schreibweise „Rexhep Malaj“ aufgeführt.",
        source_citation: "Interview des Vereins Topanica, SAM24.info, 30. Mai 2025; KQZ, Wahllokale 2014",
      },
    },
  },
];

const GALLERY_CREDIT_EN = "Village Archive / Facebook";
const GALLERY_CREDIT_DE = "Dorfarchiv / Facebook";

const GALLERY_TRANSLATIONS: GalleryTranslationSeed[] = [
  {
    id: 1,
    imageUrl: "/gallery/topanica-01.webp",
    translations: {
      en: { title: "The first Hajj pilgrims in the Municipality of Kamenicë", credit: GALLERY_CREDIT_EN },
      de: { title: "Die ersten Hadsch-Pilger in der Gemeinde Kamenicë", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 2,
    imageUrl: "/gallery/topanica-02.webp",
    translations: {
      en: { title: "Village community during the construction of the mosque (1969)", credit: GALLERY_CREDIT_EN },
      de: { title: "Die Dorfgemeinschaft beim Bau der Moschee (1969)", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 3,
    imageUrl: "/gallery/topanica-03.webp",
    translations: {
      en: { title: "KSF officer R. Rexha from Topanicë", credit: GALLERY_CREDIT_EN },
      de: { title: "FSK-Offizier R. Rexha aus Topanicë", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 4,
    imageUrl: "/gallery/topanica-04.webp",
    translations: {
      en: { title: "Certificate of appreciation from the school for Shoqata Topanica", credit: GALLERY_CREDIT_EN },
      de: { title: "Dankesurkunde der Schule für den Verein Topanica", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 5,
    imageUrl: "/gallery/topanica-05.webp",
    translations: {
      en: { title: "Congregation gathering at the village mosque", credit: GALLERY_CREDIT_EN },
      de: { title: "Zusammenkunft der Gemeinde in der Dorfmoschee", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 6,
    imageUrl: "/gallery/topanica-06.webp",
    translations: {
      en: { title: "Election of the Presidency of the Topanica Association", credit: GALLERY_CREDIT_EN },
      de: { title: "Wahl des Vorstands des Vereins Topanica", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 7,
    imageUrl: "/gallery/topanica-07.webp",
    translations: {
      en: { title: "Topanicë diaspora at the association assembly", credit: GALLERY_CREDIT_EN },
      de: { title: "Die Diaspora von Topanicë bei der Vereinsversammlung", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 8,
    imageUrl: "/gallery/topanica-08.webp",
    translations: {
      en: { title: "Construction of the Topanicë Mosque in 1969", credit: GALLERY_CREDIT_EN },
      de: { title: "Bau der Moschee von Topanicë im Jahr 1969", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 9,
    imageUrl: "/gallery/topanica-09.webp",
    translations: {
      en: { title: "Winding road toward the village at sunset", credit: GALLERY_CREDIT_EN },
      de: { title: "Gewundene Straße ins Dorf bei Sonnenuntergang", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 10,
    imageUrl: "/gallery/topanica-10.webp",
    translations: {
      en: { title: "The new mosque and the village center", credit: GALLERY_CREDIT_EN },
      de: { title: "Die neue Moschee und das Dorfzentrum", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 11,
    imageUrl: "/gallery/topanica-11.webp",
    translations: {
      en: { title: "Aerial view of the Topanicë valley", credit: GALLERY_CREDIT_EN },
      de: { title: "Das Tal von Topanicë aus der Luft", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 12,
    imageUrl: "/gallery/topanica-12.webp",
    translations: {
      en: { title: "Frosty, misty morning over the village", credit: GALLERY_CREDIT_EN },
      de: { title: "Frostiger Morgen mit Nebel über dem Dorf", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 13,
    imageUrl: "/gallery/topanica-13.webp",
    translations: {
      en: { title: "Wide view of Topanicë under a clear sky", credit: GALLERY_CREDIT_EN },
      de: { title: "Weiter Blick über Topanicë unter klarem Himmel", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 14,
    imageUrl: "/gallery/topanica-14.webp",
    translations: {
      en: { title: "Goal celebration at the football tournament", credit: GALLERY_CREDIT_EN },
      de: { title: "Torjubel beim Fußballturnier", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 15,
    imageUrl: "/gallery/topanica-15.webp",
    translations: {
      en: { title: "Central road and neighborhoods of Topanicë", credit: GALLERY_CREDIT_EN },
      de: { title: "Hauptstraße und Dorfteile von Topanicë", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 16,
    imageUrl: "/gallery/topanica-16.webp",
    translations: {
      en: { title: "Village youth in red-and-black jerseys", credit: GALLERY_CREDIT_EN },
      de: { title: "Die Dorfjugend in rot-schwarzen Trikots", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 17,
    imageUrl: "/gallery/topanica-17.webp",
    translations: {
      en: { title: "Participants of the youth football tournament", credit: GALLERY_CREDIT_EN },
      de: { title: "Teilnehmer des Jugend-Fußballturniers", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 18,
    imageUrl: "/gallery/topanica-18.webp",
    translations: {
      en: { title: "Match action on the indoor pitch", credit: GALLERY_CREDIT_EN },
      de: { title: "Spielszenen auf dem Hallenplatz", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 19,
    imageUrl: "/gallery/topanica-19.webp",
    translations: {
      en: { title: "Football match between village teams", credit: GALLERY_CREDIT_EN },
      de: { title: "Fußballduell zwischen den Dorfmannschaften", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 20,
    imageUrl: "/gallery/topanica-20.webp",
    translations: {
      en: { title: "Smiles after the football match", credit: GALLERY_CREDIT_EN },
      de: { title: "Lächeln nach dem Fußballspiel", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 21,
    imageUrl: "/gallery/topanica-21.webp",
    translations: {
      en: { title: "Street lighting along the village road", credit: GALLERY_CREDIT_EN },
      de: { title: "Straßenbeleuchtung entlang der Dorfstraße", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 22,
    imageUrl: "/gallery/topanica-22.webp",
    translations: {
      en: { title: "Illuminated mihrab of the new mosque", credit: GALLERY_CREDIT_EN },
      de: { title: "Beleuchteter Mihrab der neuen Moschee", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 23,
    imageUrl: "/gallery/topanica-23.webp",
    translations: {
      en: { title: "Festive ceremony at the Topanicë Mosque", credit: GALLERY_CREDIT_EN },
      de: { title: "Festliche Zeremonie in der Moschee von Topanicë", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 24,
    imageUrl: "/gallery/topanica-24.webp",
    translations: {
      en: { title: "Main prayer hall inside the mosque", credit: GALLERY_CREDIT_EN },
      de: { title: "Großer Gebetssaal in der Moschee", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 25,
    imageUrl: "/gallery/topanica-25.webp",
    translations: {
      en: { title: "Air Kosova model aircraft by Gezim Morina", credit: GALLERY_CREDIT_EN },
      de: { title: "Modellflugzeug „Air Kosova“ von Gezim Morina", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 26,
    imageUrl: "/gallery/topanica-26.webp",
    translations: {
      en: { title: "Model aircraft displayed on the field runway", credit: GALLERY_CREDIT_EN },
      de: { title: "Vorführung des Modellflugzeugs auf der Startbahn", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 27,
    imageUrl: "/gallery/topanica-27.webp",
    translations: {
      en: { title: "Topanicë village football team", credit: GALLERY_CREDIT_EN },
      de: { title: "Fußballmannschaft des Dorfes Topanicë", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 28,
    imageUrl: "/gallery/topanica-28.webp",
    translations: {
      en: { title: "New houses and construction in the village", credit: GALLERY_CREDIT_EN },
      de: { title: "Neubauten und neue Häuser im Dorf", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 29,
    imageUrl: "/gallery/topanica-29.webp",
    translations: {
      en: { title: "Night view with the illuminated mosque", credit: GALLERY_CREDIT_EN },
      de: { title: "Nachtansicht mit der beleuchteten Moschee", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 30,
    imageUrl: "/gallery/topanica-30.webp",
    translations: {
      en: { title: "Morning mist over the fields of Topanicë", credit: GALLERY_CREDIT_EN },
      de: { title: "Morgennebel über den Feldern von Topanicë", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 31,
    imageUrl: "/gallery/topanica-31.webp",
    translations: {
      en: { title: "Haystacks at dawn beside the stream", credit: GALLERY_CREDIT_EN },
      de: { title: "Heuhaufen im Morgengrauen am Bachufer", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 32,
    imageUrl: "/gallery/topanica-32.webp",
    translations: {
      en: { title: "Dusk over the illuminated mosque dome", credit: GALLERY_CREDIT_EN },
      de: { title: "Abenddämmerung über der beleuchteten Moscheekuppel", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 33,
    imageUrl: "/gallery/topanica-33.webp",
    translations: {
      en: { title: "Fiery sunset over the village valley", credit: GALLERY_CREDIT_EN },
      de: { title: "Feuriger Sonnenuntergang über dem Dorftal", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 34,
    imageUrl: "/gallery/topanica-34.webp",
    translations: {
      en: { title: "Tree-shaded village lane", credit: GALLERY_CREDIT_EN },
      de: { title: "Dorfstraße im Schatten der Bäume", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 35,
    imageUrl: "/gallery/topanica-35.webp",
    translations: {
      en: { title: "Lumi i Shtrembër near the village", credit: GALLERY_CREDIT_EN },
      de: { title: "Lumi i Shtrembër am Dorfrand", credit: GALLERY_CREDIT_DE },
    },
  },
  {
    id: 36,
    imageUrl: "/gallery/topanica-36.webp",
    translations: {
      en: { title: "Historical interior view of the mosque", credit: GALLERY_CREDIT_EN },
      de: { title: "Historische Innenansicht der Moschee", credit: GALLERY_CREDIT_DE },
    },
  },
];

const LOCALES: TranslationLocale[] = ["en", "de"];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Set DATABASE_URL before seeding translations.");
  }

  const sql = neon(process.env.DATABASE_URL);

  const [existingArticles, existingHistory, existingGallery] = await Promise.all([
    sql`SELECT id, slug FROM articles`,
    sql`SELECT id, sort_order FROM history_entries`,
    sql`SELECT id, image_url FROM gallery_photos`,
  ]);

  const articleSlugById = new Map<number, string>(
    existingArticles.map((row) => [Number(row.id), String(row.slug)]),
  );
  const historySortById = new Map<number, number>(
    existingHistory.map((row) => [Number(row.id), Number(row.sort_order)]),
  );
  const galleryUrlById = new Map<number, string>(
    existingGallery.map((row) => [Number(row.id), String(row.image_url)]),
  );

  let articleUpserts = 0;
  for (const item of ARTICLE_TRANSLATIONS) {
    const dbSlug = articleSlugById.get(item.id);
    if (!dbSlug) {
      throw new Error(`Article id=${item.id} (${item.slug}) not found in articles table.`);
    }
    if (dbSlug !== item.slug) {
      throw new Error(`Article id=${item.id} slug mismatch: expected ${item.slug}, found ${dbSlug}.`);
    }
    for (const locale of LOCALES) {
      const tr = item.translations[locale];
      await sql`
        INSERT INTO article_translations (article_id, locale, title, summary, body, updated_at)
        VALUES (${item.id}, ${locale}, ${tr.title}, ${tr.summary}, ${tr.body}, NOW())
        ON CONFLICT (article_id, locale) DO UPDATE SET
          title = EXCLUDED.title,
          summary = EXCLUDED.summary,
          body = EXCLUDED.body,
          updated_at = NOW()
      `;
      articleUpserts++;
    }
  }

  let historyUpserts = 0;
  for (const item of HISTORY_TRANSLATIONS) {
    const dbSortOrder = historySortById.get(item.id);
    if (dbSortOrder === undefined) {
      throw new Error(`History entry id=${item.id} not found in history_entries table.`);
    }
    if (dbSortOrder !== item.sortOrder) {
      throw new Error(
        `History entry id=${item.id} sort_order mismatch: expected ${item.sortOrder}, found ${dbSortOrder}.`,
      );
    }
    for (const locale of LOCALES) {
      const tr = item.translations[locale];
      await sql`
        INSERT INTO history_entry_translations (
          history_entry_id, locale, era_year, title, content, source_citation, updated_at
        )
        VALUES (${item.id}, ${locale}, ${tr.era_year}, ${tr.title}, ${tr.content}, ${tr.source_citation}, NOW())
        ON CONFLICT (history_entry_id, locale) DO UPDATE SET
          era_year = EXCLUDED.era_year,
          title = EXCLUDED.title,
          content = EXCLUDED.content,
          source_citation = EXCLUDED.source_citation,
          updated_at = NOW()
      `;
      historyUpserts++;
    }
  }

  let galleryUpserts = 0;
  for (const item of GALLERY_TRANSLATIONS) {
    const dbImageUrl = galleryUrlById.get(item.id);
    if (!dbImageUrl) {
      throw new Error(`Gallery photo id=${item.id} (${item.imageUrl}) not found in gallery_photos table.`);
    }
    if (dbImageUrl !== item.imageUrl) {
      throw new Error(
        `Gallery photo id=${item.id} image_url mismatch: expected ${item.imageUrl}, found ${dbImageUrl}.`,
      );
    }
    for (const locale of LOCALES) {
      const tr = item.translations[locale];
      await sql`
        INSERT INTO gallery_photo_translations (gallery_photo_id, locale, title, credit, updated_at)
        VALUES (${item.id}, ${locale}, ${tr.title}, ${tr.credit}, NOW())
        ON CONFLICT (gallery_photo_id, locale) DO UPDATE SET
          title = EXCLUDED.title,
          credit = EXCLUDED.credit,
          updated_at = NOW()
      `;
      galleryUpserts++;
    }
  }

  const [atCount, htCount, gtCount] = await Promise.all([
    sql`SELECT count(*)::int AS count FROM article_translations`,
    sql`SELECT count(*)::int AS count FROM history_entry_translations`,
    sql`SELECT count(*)::int AS count FROM gallery_photo_translations`,
  ]);

  console.log(
    JSON.stringify(
      {
        upserted: {
          article_translations: articleUpserts,
          history_entry_translations: historyUpserts,
          gallery_photo_translations: galleryUpserts,
        },
        totals: {
          article_translations: atCount[0].count,
          history_entry_translations: htCount[0].count,
          gallery_photo_translations: gtCount[0].count,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("Translation seed failed:", error);
  process.exitCode = 1;
});
