# Tiny Orindiúva

Orindiúva (SP) em miniatura: mapa isométrico interativo inspirado no [Tiny SP](https://tiny-sp.agenturl.dev/), com implementação e arte procedurais próprias.

**[Explorar o mapa](https://mateusfrmacedo.github.io/tiny_orindiuva/)**

- 220 segmentos de ruas/caminhos e 18 lugares a partir de um recorte do OpenStreetMap.
- 2.316 contornos de edificações (2.308 Microsoft/Bing e 8 OpenStreetMap), sem preenchimento de casas fictícias.
- Paleta regional de telhados cerâmicos e coberturas claras, quintais em tons secos, árvores de rua, matas densas e palmeiras em pixel art.
- Detalhes internos esquemáticos de praças, campos de futebol, tênis, piscinas e cemitério, refinados com referências aéreas fornecidas pelo usuário.
- Telhados texturizados, sombras e controles compactos inspirados no Tiny SP.
- Vista isométrica e vista de planta com norte para cima; botão para enquadrar a área urbana.
- Controle **Aa Nomes** mostra/oculta os nomes das ruas nas duas vistas. Começa oculto para deixar o desenho limpo e salva a preferência no navegador. Em zoom distante, os nomes não aparecem para evitar sobreposição.
- Busca por rua com enquadramento do traçado completo e destaque em amarelo.
- Toque em uma construção para conferir fonte e área aproximada.
- Arraste, zoom, gestos de pinça, teclado e busca por rua/lugar.
- Links compartilháveis que preservam a câmera.
- Linha do tempo de 24 horas com amanhecer, dia, pôr do sol, noite e janelas iluminadas. O botão **Agora** acompanha o relógio de Orindiúva (`America/Sao_Paulo`); links com `?time=1320` preservam uma hora escolhida em minutos (22h). A iluminação usa transições artísticas, sem calcular horários astronômicos de nascer/pôr do sol.
- Clima atual da Open-Meteo, atualizado a cada 15 minutos; chuva e iluminação acompanham as condições. Modos manuais permitem experimentar tempo aberto e chuva, independentemente da hora da cena.
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

Não há alturas disponíveis para os contornos Microsoft desse recorte. A elevação padrão de 4,5 m e a igreja estilizada são escolhas visuais, não medições. Fachadas, cores e tipos de telhado também são ilustrativos. A distribuição visual de materiais foi ajustada a partir de oito capturas aéreas do Apple Maps enviadas pelo usuário em 6/11/2026: a data é a da captura de tela, não uma data confirmada da imagem aérea. Os arquivos originais não são incluídos nem publicados. A cobertura arbórea e a água usam um recorte do ESA WorldCover 2021 v200, com resolução de 10 metros e simplificação dos polígonos. É um retrato de 2021, sujeito a desatualização. Árvores decorativas ficam restritas às áreas dessa classificação, praças, linhas de árvores e margens de ruas mapeadas; sua localização individual não é um inventário real. Terrenos sem informação ficam neutros, sem gerar talhões agrícolas imaginários.

Google Maps, Apple Maps e Bing Maps foram consultados visualmente para comparar a configuração geral da cidade e observar o centro com mais detalhe. O croqui urbanístico da prefeitura (fevereiro/2021) também foi consultado. Nenhum tile, imagem de satélite, fachada do Street View ou arquivo das capturas enviadas é distribuído pelo aplicativo. Os contornos de ruas, construções e áreas continuam vindo de OSM/Microsoft/ESA. A geometria vem dos conjuntos abertos identificados acima. As referências fornecidas orientam a aparência e interiores esquemáticos, sem converter esses detalhes em levantamento cadastral. O arquivo `public/data/visual-details.json` associa estilos a áreas OSM e registra a referência e a confiança da associação. O croqui enviado identifica a Praça Irinéia Figueiredo Barbosa (fonte, também confirmada no guia municipal Onde Visitar) e a Praça Jair Nunes dos Santos (jardim formal). Os caminhos internos continuam esquemáticos. Para reprodução exata das fachadas, seriam necessárias fotos próprias/autorizadas e medição complementar.

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
- O REA foi avaliado como possibilidade de análise. Não foi necessário instalá-lo: a inspeção pública da referência e os dados cartográficos bastaram para esta implementação.

Código do aplicativo sob licença MIT; dados e fontes mantêm suas licenças próprias.

## Acabamento e desempenho

A análise do TinyRJ com REA está registrada em [docs/reference-analysis.md](docs/reference-analysis.md). Vancouver também foi consultado como referência visual. O projeto mantém renderização própria e dados geográficos de Orindiúva.

O mapa redesenha sob demanda: sol e nuvens não mantêm animação contínua. A chuva tem limite de 24 atualizações por segundo e para com a aba oculta. Um índice espacial seleciona os objetos visíveis mantendo a ordem de sobreposição. Geometria estática, copas e texturas de telhas são reutilizadas. Os telhados inclinados preservam o contorno original, com elevação ilustrativa.

Para medir localmente, abra o servidor de desenvolvimento com `?profile=1&time=720`: o console registra duração dos desenhos e contagem de quadros/efeitos a cada dois segundos. A instrumentação fica desativada na publicação.
