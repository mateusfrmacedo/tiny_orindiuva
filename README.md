# Tiny Orindiúva

Orindiúva (SP) em miniatura: mapa isométrico interativo inspirado no [Tiny SP](https://tiny-sp.agenturl.dev/), com implementação e arte procedurais próprias.

**[Explorar o mapa](https://mateusfrmacedo.github.io/tiny_orindiuva/)**

- 220 segmentos de ruas/caminhos e 19 lugares a partir de um recorte do OpenStreetMap.
- 2.315 contornos de edificações (2.307 Microsoft/Bing e 8 OpenStreetMap), sem preenchimento de casas fictícias.
- Paleta regional de telhados cerâmicos e coberturas claras, quintais em tons secos, árvores de rua, matas densas e palmeiras em pixel art.
- Detalhes internos esquemáticos de praças, campos de futebol, tênis, piscinas e cemitério, refinados com referências aéreas fornecidas pelo usuário.
- Telhados de duas e quatro águas, textura de telhas orientada pela cobertura, chapas, cumeeiras, sombras, portas, garagens e caixilhos voltados para a rua. Fachadas e materiais são interpretações regionais.
- Vista isométrica e vista de planta com norte para cima; botão para enquadrar a área urbana.
- Controle **Aa Nomes** mostra/oculta os nomes das ruas nas duas vistas. Começa oculto para deixar o desenho limpo e salva a preferência no navegador. Em zoom distante, os nomes não aparecem para evitar sobreposição.
- Busca por rua com enquadramento do traçado completo e destaque em amarelo.
- Toque em uma construção para conferir fonte e área aproximada.
- Arraste, zoom, gestos de pinça, teclado e busca por rua/lugar.
- Links compartilháveis que preservam a câmera.
- Linha do tempo de 24 horas com amanhecer, dia, pôr do sol, noite e janelas iluminadas. O botão **Agora** acompanha o relógio de Orindiúva (`America/Sao_Paulo`); links com `?time=1320` preservam uma hora escolhida em minutos (22h). A iluminação usa transições artísticas, sem calcular horários astronômicos de nascer/pôr do sol.
- Clima atual da Open-Meteo, atualizado a cada 15 minutos; chuva e iluminação acompanham as condições. Modos manuais permitem experimentar tempo aberto, nuvens e chuva, independentemente da hora da cena.
- Nuvens com volume, sombras suaves e deslocamento pelo vento; pequenos bandos sobre praças e ondulações na fonte. Chuva continua funcionando à noite.
- Ajustes independentes de nuvens e pássaros e botão **Movimento da cidade** para pausar todos os efeitos.
- Layout responsivo, nomes em português e respeito à preferência por movimento reduzido.

## Executar

Requer Node.js 22.12+ ou 24.

```sh
npm ci
npm run dev
npm test
npm run build
```

O build estático fica em `dist/`. O workflow `.github/workflows/deploy.yml` publica a branch `main` no GitHub Pages. Configure o Pages com fonte **GitHub Actions**.

## Cartografia e limites

`public/data/orindiuva.osm` é um recorte obtido da API oficial do OpenStreetMap em 6 de novembro de 2026. Ruas, praças, caminhos e lugares preservam as coordenadas da base. `public/data/buildings-microsoft.geojson` é um recorte do conjunto aberto Microsoft Global ML Building Footprints (Bing), quadkey `210133203`, distribuição `2026-07-24`.

Os cruzamentos usam superfícies unidas antes da projeção, sem pintar uma calçada por cima da via transversal. As superfícies são calculadas em metros e então projetadas; as larguras são estimadas, pois o recorte não contém essa medida. Os IDs dos nós OSM são preservados para auditar ligações. A rede contém um componente principal com todas as ruas públicas, uma estrada agrícola privada separada e quatro pequenos conjuntos de caminhos de pedestres. Nenhuma ligação viária é criada por proximidade.

Os contornos preservam todos os vértices, orientações e formatos das geometrias de origem, inclusive edifícios côncavos. Polígonos Microsoft que duplicam construções OSM são substituídos pelas geometrias OSM. Nenhuma casa é gerada para preencher quadras. Uma detecção Microsoft dentro da praça foi reinterpretada como fonte circular com base na referência aérea enviada; sua geometria original e a justificativa são preservadas em `referenceCorrections` no modelo. Não se trata de cadastro imobiliário: as detecções automáticas podem omitir ou confundir construções e a data da distribuição não é a data das imagens.

Não há alturas disponíveis para os contornos Microsoft desse recorte. Os beirais ilustrativos variam entre 3,2 m nas construções pequenas, 4,2 m nas médias e 5,5 m nas maiores, refletindo a predominância de térreas observada nas fotos. A igreja estilizada e essas alturas são escolhas visuais, não medições. Fachadas, cores e tipos de telhado também são ilustrativos. A distribuição visual de materiais foi ajustada a partir de oito capturas aéreas do Apple Maps enviadas pelo usuário em 6/11/2026: a data é a da captura de tela, não uma data confirmada da imagem aérea. Os arquivos originais não são incluídos nem publicados. A cobertura arbórea e a água usam um recorte do ESA WorldCover 2021 v200, com resolução de 10 metros e simplificação dos polígonos. É um retrato de 2021, sujeito a desatualização. Árvores decorativas ficam restritas às áreas dessa classificação, praças, linhas de árvores e margens de ruas mapeadas; sua localização individual não é um inventário real. Terrenos sem informação ficam neutros, sem gerar talhões agrícolas imaginários.

Google Maps, Apple Maps e Bing Maps foram consultados visualmente para comparar a configuração geral da cidade e observar o centro com mais detalhe. O croqui urbanístico da prefeitura (fevereiro/2021) também foi consultado. Nenhum tile, imagem de satélite, fachada do Street View ou arquivo das capturas enviadas é distribuído pelo aplicativo. Os contornos de ruas, construções e áreas continuam vindo de OSM/Microsoft/ESA. A geometria vem dos conjuntos abertos identificados acima. As referências fornecidas orientam a aparência e interiores esquemáticos, sem converter esses detalhes em levantamento cadastral. O arquivo `public/data/visual-details.json` associa estilos a áreas OSM e registra a referência e a confiança da associação. O croqui enviado identifica a Praça Irinéia Figueiredo Barbosa (fonte, também confirmada no guia municipal Onde Visitar) e a Praça Jair Nunes dos Santos. Esta foi refeita depois pela vista de satélite e pelo Street View (janeiro de 2025): piso intertravado rosado, faixa de concreto com vagas ao longo da avenida, ilhas de grama com meio-fio, três pórticos de cor terracota, postes de braço curvo com globo branco, bancos de ripas, lixeiras duplas, mudas em vasos redondos de concreto e os três quiosques (Juarez Lanches, sanitários verdes e Baguete House). As posições foram calibradas nos três quiosques mapeados; tamanhos e quantidades são estimados. Na Praça Irinéia Figueiredo Barbosa, o Street View orientou os bancos brancos de concreto em volta da fonte, os postes altos de LED e o quiosque branco. A Prefeitura (paredes verde-claras, faixa e pilastras coral, letreiro "Prefeitura Municipal") e a E.M.E.F. Prof. Osvaldo Alves Ferreira (paredes brancas, faixa azul com o nome, janelas basculantes e cobertura curva azul na entrada) seguem as fachadas vistas no Street View. O letreiro fica na fachada da rua; quando ela está de costas para a câmera, não aparece. A coleção de capturas do Street View do autor (pasta local `streetview_orindiuva`, fora do repositório) orientou também as fachadas da Escola Municipal Joaquim Mendonça (verde com pilastras coral, faixa de pastilhas e coberturas brancas), da Câmara Municipal, do Anfiteatro Municipal, do Centro de Saúde Maria Aparecida de Oliveira, dos Correios, da Delegacia de Polícia, do Supermercado Munhoz, do Terminal Rodoviário, da E.E. Antônio Marin e do prédio de arcos junto à Praça Maria Dias. Prédios públicos com laje ganharam cobertura plana clara. A mesma coleção orientou o ginásio da quadra poliesportiva no centro esportivo (base verde e chapas cinza), o Clube Arcecco (blocos aparentes e cobertura plana), o NAEE ao lado do CRAS (paredes verde-água com placa) e o galpão de chapas da esquina; a foto do CRAS não mostra a fachada dele, por isso o prédio não recebeu letreiro. O Cemitério Municipal ganhou o portão de pilares de tijolo com a viga verde "CEMITÉRIO MUNICIPAL" e o muro verde-menta com pilaretes e capa de tijolo. A Praça Flávia Marina tem calçada de concreto avermelhado, canteiros de grama entre caminhos diagonais de terra, os orelhões verde e laranja, um banco com placa e uma palmeira. As fotos da Praça Caxalu foram tiradas junto à área que o OSM chama de Praça Florisa Maria dos Santos: ela tem vagas com faixas amarelas na rua, ciclovia vermelha contornando o gramado, caminhos curvos que se encontram numa pracinha redonda, palmeiras, postes de LED e um parquinho vermelho e amarelo. Nas ruas fotografadas (Horacina Andrade Borges, Vereador Osvaldo Kushida, José Fábio Garcez Novaes, Maria Gonçalves Barbosa, Sabino Roberto, Adolfo de Oliveira Martins e Gil Cândido da Silva), as casas usam a paleta de cores de cada rua e ganham muros na frente (reboco branco, bloco cinza, tijolo, cores pastel ou grade sobre mureta, com portão de chapa). A cor de cada casa é sorteada na paleta da rua, não levantada casa a casa. O muro só aparece onde há recuo entre a casa e a calçada e não cruza ruas, praças ou outras construções. Portões, letreiros e muros que ficam de lado ou de costas para a câmera fixa podem aparecer só de perfil. Nas outras praças, os caminhos internos continuam esquemáticos. Para reprodução exata das fachadas, seriam necessárias fotos próprias/autorizadas e medição complementar.

Para recompilar `public/data/map.json`, use Python 3 com `shapely` instalado e execute `python scripts/prepare-map.py`. O recorte ESA foi obtido com `scripts/fetch-landcover.py` (requer rasterio). Os recortes estão incluídos; o mapa não depende de chamadas aos fornecedores durante a navegação. Não existe backend nem chave secreta. Os testes verificam a preservação dos vértices Microsoft, a reversibilidade das projeções, a cobertura do asfalto nos segmentos e cruzamentos, os nós originais das ruas e a conectividade da rede pública.

A API meteorológica oferece condições de modelo para a grade próxima a Orindiúva, não uma estação na praça. Se estiver indisponível, o site informa a falha e mantém os modos ilustrativos disponíveis. Dados de clima não são inventados.

## Créditos e licenças

- Dados cartográficos: © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/). O recorte OSM e a base derivada `map.json` são distribuídos sob ODbL.
- Edificações: [Microsoft Global ML Building Footprints / Bing](https://github.com/microsoft/GlobalMLBuildingFootprints), [CDLA Permissive 2.0](https://cdla.dev/permissive-2-0/). A licença está em `public/data/MICROSOFT-LICENSE.txt`; o recorte Microsoft independente mantém essa licença.
- Cobertura do solo: © ESA WorldCover project 2021 / Contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Recorte e simplificação de cobertura arbórea/água. [Acesso oficial](https://esa-worldcover.org/en/data-access).
- Referências de apresentação: [IsoCities](https://isocities.agenturl.dev/) e [Isometric NYC](https://github.com/cannoneyed/isometric-nyc). Nenhum código ou asset desses projetos foi incorporado.
- Referência urbana: [croqui da Prefeitura de Orindiúva, fevereiro/2021](https://orindiuva.sp.gov.br/wp-content/uploads/2022/04/MAPA-DA-CIDADE-BAIRROS-Atualizado-Model.pdf).
- Clima: [Open-Meteo](https://open-meteo.com/), dados sob [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). A API pública gratuita destina-se a uso não comercial, conforme os termos do serviço.
- Fontes: DM Sans e Space Mono, via Google Fonts, sob SIL Open Font License.
- Referência visual: Tiny SP. Nenhum código ou asset do Tiny SP foi incorporado.
- Análise anterior do cliente público TinyRJ com REA: [registro e limites](docs/reference-analysis.md).

Código do aplicativo sob licença MIT; dados e fontes mantêm suas licenças próprias.

## Acabamento e desempenho

A análise do TinyRJ com REA está registrada em [docs/reference-analysis.md](docs/reference-analysis.md). Vancouver também foi consultado como referência visual. O projeto mantém renderização própria e dados geográficos de Orindiúva.

O mapa base redesenha sob demanda. Trânsito e atmosfera usam camadas separadas, com limite de 24 atualizações por segundo e pausa em aba oculta. Nuvens, pássaros e chuva animam apenas a camada de efeitos. **Movimento da cidade** desativado interrompe todas as animações; redução de movimento também mantém a cena estática. Nuvens usam sprites com volume de densidade 3D integrado uma vez e reutilizado: é uma aparência volumétrica em uma cena 2,5D, sem ray marching por quadro ou contexto WebGL adicional. O orçamento limita nuvens a 8, pássaros a 15 e gotas a 240 na tela. O trânsito é decorativo: segue os segmentos e sentidos das ruas mapeadas, sem representar veículos, viagens, sinais ou congestionamentos reais. Um índice espacial seleciona os objetos visíveis mantendo a ordem de sobreposição. Geometria estática, copas e texturas de telhas são reutilizadas. Os telhados inclinados preservam o contorno de exibição selecionado, com elevação ilustrativa. Próximo ao mapa há texturas e detalhes de fachada; longe, esses detalhes deixam de ser desenhados. A chuva usa os códigos WMO e uma intensidade visual limitada a partir da precipitação informada, sem simular uma taxa física exata.

Para medir localmente, abra o servidor de desenvolvimento com `?profile=1&time=720`: o console registra duração dos desenhos e contagem de quadros/efeitos a cada dois segundos. A instrumentação fica desativada na publicação.

## Revisão pelas fotos do autor

As panorâmicas de abril de 2026 fornecidas pelo usuário orientaram a igreja e a Praça Maria Dias. A maquete da igreja foi refeita pela foto aérea 360 do autor (abril de 2026). Ela tem planta em cruz latina sob uma cobertura baixa de telha metálica clara, com rufos cinza nas águas. A fachada noroeste tem cantos chanfrados e uma torre baixa de três pavimentos, com porta e janela em arco, veneziana quadrada, cornija ocre e agulha piramidal de ardósia encimada por uma cruz metálica. Há janelas em arco com moldura cinza entre pilastras cinza-escuro, portas nos braços do transepto, escadaria na frente e uma rampa com guarda-corpo na lateral sudoeste. As proporções foram estimadas a olho; nenhuma imagem foi copiada. À noite, só acendem as janelas que não ficam atrás do telhado. Os volumes adicionais são estimativas visuais registradas em `building.visual`; o contorno Microsoft original permanece intacto nos dados. A igreja tem um contorno visual aproximado, revisado pela captura aérea de 19:48:45, usado também na vista de planta e no minimapa. A praça recebeu piso em tons gastos, adro aberto, a árvore isolada e os agrupamentos assimétricos de copas observados na captura. Árvores decorativas são afastadas de construções, ruas e dos volumes da igreja. O estilo pixelado anterior das copas foi recuperado.

A interface usa uma barra de ferramentas lateral e minimapa navegável, inspirados nas referências. Nomes de ruas e lugares ficam em Ajustes; o botão do carro ativa/desativa o trânsito. Em acessibilidade com redução de movimento, todos os efeitos permanecem estáticos.

## Vida, clima e interface (novembro de 2026)

- **Nenhuma casa sobre a rua.** Depois do registro e dos ajustes abaixo, `scripts/street_trim.py` recorta, só na exibição, a parte de um contorno que cai sobre a pista mais 0,4 m de meio-fio. Quando sobraria menos da metade, a detecção é retida (`map.withheldBuildings`, 2 casos) em vez de desenhada; o contorno de origem continua no modelo. Um teste percorre as bordas de todas as construções exibidas contra a largura de cada via.
- **Clima vivo.** Os códigos WMO da Open-Meteo viram sete cenas: céu limpo, poucas nuvens, nublado, neblina, garoa, chuva e tempestade com raios. As nuvens são cúmulos com topo iluminado, base acinzentada, sombra no chão e paletas de entardecer e noite; ficam mais ralas ao aproximar a câmera das ruas. Neblina usa bancos baixos que derivam com o vento. A chuva escurece o céu, molha o asfalto e cria respingos nas ruas.
- **Gente na rua.** Pedestres ilustrativos andam pelas calçadas (deslocadas do eixo das vias) e pelos caminhos das praças, mais concentrados perto da Praça Maria Dias, com guarda-chuva na chuva e menos gente à noite. Ficam atrás das casas e árvores pela mesma máscara dos carros. É uma simulação local, não um registro de pessoas reais.
- **Detalhes observados nas imagens aéreas do Apple Mapas, consultadas visualmente pelo autor em 8/11/2026:** painéis solares em parte dos telhados (desenhados na água voltada para o norte) e a terra vermelha das ruas de chão. Nenhum dado, nome de lugar ou imagem do Apple Mapas foi copiado.
- **Trevo de Orindiúva.** O recorte OSM inclui a rotatória da SP-322 com a Vicinal Francisco Munhoz Porcel (trechos de ~420 m em volta do trevo). Na ilha fica o letreiro: coração vazado e ORINDIÚVA em letras de bloco, uma cor por letra, sobre mureta de tijolo aparente, com palmeiras de tronco caiado em volta. O desenho é próprio, a partir da observação do autor de imagens públicas ao nível da rua (janeiro de 2025); nenhuma imagem foi copiada. O letreiro é desenhado 1,8× maior que o real para ser legível no mapa e fica aceso à noite.
- **Clima desligável.** No painel do clima, "Sem clima" fixa um céu limpo sem nuvens, chuva ou neblina e fica salvo entre visitas; "Mostrar nuvens" liga e desliga as nuvens.
- **Interface de miniatura.** Painéis de vidro escuro, acento laranja e fonte Geist; faixa de lugares no topo com miniaturas desenhadas pelo próprio mapa; efeito *tilt-shift* com intensidade ajustável (tecla D); passeio automático pelos lugares; atalhos `0` (cidade inteira) e `/` (busca). O padrão de interface foi estudado no TinyRJ apenas pelo que é visível ao visitante (capturas, medidas, cores e fontes), sem copiar código, arte ou textos.

## Registro das construções às ruas

A publicação no GitHub Pages regenera `public/data/map.json` com `scripts/prepare-map.py` antes dos testes e do build, a partir dos dados brutos versionados.

As imagens do Bing (de onde vêm os contornos da Microsoft) e as usadas para traçar as ruas do OSM não estão perfeitamente sobrepostas. Medido neste recorte, os contornos ficavam deslocados alguns metros na mesma direção em todos os quadrantes da cidade, por isso muitas casas apareciam sobre o asfalto. `scripts/registration.py` estima **uma única translação rígida** (sem rotação nem escala, limitada a 8 m) que minimiza a área de construção sobre a pista, e o gerador a aplica a todos os contornos Microsoft antes das demais etapas. No recorte de 2026-11-06 o resultado é (−5,0 m; +0,75 m): construções com mais de 2 m² sobre a pista caem de 429 para 152 e a área sobre a pista de 11.545 m² para 2.017 m². O relatório fica em `map.registrationReport`. Com o registro, um contorno passou a coincidir com uma edificação OSM e é descartado como duplicata. `building.points` são os vértices originais acrescidos dessa translação; os testes verificam isso exatamente.

Depois do alinhamento (abaixo), `scripts/placement_clearance.py` afasta da pista, em até 3 m e dentro da mesma quadra, as casas que ainda invadem a via (`building.placement`). Restam 91 casos que exigiriam mover mais ou atravessar a quadra; eles ficam listados em `docs/placement-review.json` (gerado ao rodar `python3 scripts/prepare-map.py`) para revisão, sem correção forçada.

## Alinhamento visual às quadras

A pedido do usuário, o gerador avalia as construções contra a orientação local de ruas e quadras OSM. Quando há consenso de direção e o formato é predominantemente ortogonal, grava uma transformação rígida em `building.alignment`. A transformação preserva forma, área, vértices e vazios, com rotação de até 8°, translação de até 1 m e deslocamento de qualquer vértice limitado a 2,25 m. Não pode aumentar de forma significativa a sobreposição com vias, construções vizinhas ou o exterior da quadra. Casos ambíguos, formatos não ortogonais, edificações OSM e praças ficam protegidos.

A revisão atual ajusta 736 das 2.315 construções. São alinhamentos inferidos, não correções cadastrais verificadas casa a casa. A panorâmica do autor `CIABIhB3Ga3kscNQA7WSywv0Hphj` orienta a aparência geral, sem produzir medições 3D. `building.points` continua sendo a geometria de origem (já registrada às ruas). Para comparar o desenho das casas com os contornos de origem, use `?geometry=source` na URL. Igreja e praça conservam a revisão específica pelas referências do autor.

A revisão de materiais, jardins e clima está documentada em [docs/quality-review.md](docs/quality-review.md).
