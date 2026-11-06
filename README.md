# Tiny Orindiúva

Orindiúva (SP) em miniatura: mapa isométrico interativo inspirado no [Tiny SP](https://tiny-sp.agenturl.dev/), com implementação e arte procedurais próprias.

**[Explorar o mapa](https://mateusfrmacedo.github.io/tiny_orindiuva/)**

- Ruas e 18 lugares reais a partir de um recorte do OpenStreetMap.
- Casas, árvores e igreja ilustradas em Canvas 2D, sem imagens do projeto de referência.
- Arraste, zoom, gestos de pinça, teclado e busca por rua/lugar.
- Links compartilháveis que preservam a câmera.
- Clima atual da Open-Meteo, atualizado a cada 15 minutos; chuva e iluminação acompanham as condições. Modos manuais permitem experimentar sol, chuva e noite.
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

`public/data/orindiuva.osm` é um recorte obtido da API oficial do OpenStreetMap em 6 de novembro de 2026. Ruas, praças e lugares usam coordenadas reais. As 1.576 casas adicionadas e as árvores são preenchimento artístico determinístico, não levantamento de imóveis. A igreja é uma representação estilizada no ponto cadastrado, não um modelo arquitetônico. As informações dos lugares refletem a cobertura da comunidade OSM e podem estar incompletas.

Para recompilar `public/data/map.json`, use Python 3 com `shapely` instalado e execute `python scripts/prepare-map.py`. O recorte está incluído, portanto o mapa não depende de chamadas ao OSM durante a navegação. Não existe backend nem chave secreta.

A API meteorológica oferece condições de modelo para a grade próxima a Orindiúva, não uma estação na praça. Se estiver indisponível, o site informa a falha e mantém os modos ilustrativos disponíveis. Dados de clima não são inventados.

## Créditos e licenças

- Dados cartográficos: © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/). O recorte OSM e a base derivada `map.json` são distribuídos sob ODbL.
- Clima: [Open-Meteo](https://open-meteo.com/), dados sob [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). A API pública gratuita destina-se a uso não comercial, conforme os termos do serviço.
- Fontes: DM Sans e Space Mono, via Google Fonts, sob SIL Open Font License.
- Referência visual: Tiny SP. Nenhum código ou asset do Tiny SP foi incorporado.
- O REA foi avaliado como possibilidade de análise. Não foi necessário instalá-lo: a inspeção pública da referência e os dados cartográficos bastaram para esta implementação.

Código do aplicativo sob licença MIT; dados e fontes mantêm suas licenças próprias.
