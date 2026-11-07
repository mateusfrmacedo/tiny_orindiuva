# Revisão visual e atmosfera — 6 e 7 de novembro de 2026

## Referências observadas

- [Centro de Orindiúva no Google Maps, vista de satélite](https://www.google.com/maps/@-20.1821272,-49.3522286,350m/data=!3m1!1e3): configuração geral do centro, quadras e Praça Maria Dias, comparada às imagens aéreas do autor. A consulta visual não é um levantamento cadastral e não produz geometria de casas extraída do Google.
- Capturas aéreas Apple Maps e panorâmicas próprias já fornecidas pelo usuário: telhas cerâmicas predominantes, casas térreas, coberturas claras de edifícios maiores, cruz branca da igreja, fonte circular e desenho dos jardins. Os arquivos não são publicados.
- [TinyRJ](https://tinyrj.com/embed.html#10146,-14134,0.1368) e [Vancouver](https://vancouver.isoworld.xyz/): escala da miniatura, detalhamento legível, circulação e interface discreta. O projeto usa sua própria renderização procedural; não incorpora tiles, artes ou código das referências.
- [Documentação oficial da Open-Meteo](https://open-meteo.com/en/docs): códigos meteorológicos, cobertura de nuvens, precipitação, velocidade e direção do vento.

## Mudanças

1. Coberturas de quatro águas em detecções aproximadamente retangulares; duas águas nos outros formatos. A projeção horizontal permanece exatamente no contorno visual selecionado. As texturas acompanham o plano de cada face, com cumeeiras e fechamento das empenas.
2. Fachadas com materiais suaves regionais, sombras orientadas, rodapé, beiral, caixilhos, soleiras, portas e garagens. A face de acesso é inferida da rua próxima e do lado exterior do contorno. Não é uma identificação da entrada real de cada imóvel.
3. Igreja mantém o contorno em cruz revisto pelas fotos, com juntas discretas na cobertura, cornijas e base das paredes. Fonte recebe anéis, borda elevada, jatos, ondulações e nova distribuição esquemática de árvores. Jardins têm bancos; campos recebem traves elevadas e redes; piscinas têm raias e acabamento de borda. Os limites das áreas mapeadas são preservados.
4. Nuvens usam um pequeno volume de densidade formado por elipsoides suavemente combinados, integrado em sprites em cache. São impostores volumétricos em Canvas 2,5D, não nuvens 3D navegáveis. Deriva orientada pelo vento da API; sombreamento suave e transparência mantêm a cidade legível.
5. Chuva em duas camadas, deslocamento pelo vento, tom de asfalto molhado e ondulações nas ruas. O estado chuvoso não desaparece à noite. A intensidade é artística, limitada para legibilidade e desempenho. Modos manuais não substituem os números meteorológicos reais mostrados no painel.
6. Pequenos bandos decorativos circulam as praças, com batida de asas e altitude variável; ficam ocultos à noite e sob chuva mais intensa. Não representam observações reais de aves.
7. Controle global de movimento, controles separados de nuvens/pássaros, persistência local e respeito a movimento reduzido. Aba oculta não anima. Câmera e controles continuam funcionando com animação pausada.

## Geometria e validação

Os 2.316 registros de construções e os 748 alinhamentos conservadores já aprovados foram mantidos. Não houve nova rotação generalizada de casas, alteração dos limites de terrenos ou preenchimento de casas inexistentes. O terreno não tem cadastro de lotes; eventuais omissões dos detectores continuam possíveis. As novas orientações de telhas e fachadas usam a mesma geometria aplicada ao prédio, ao hit test e ao minimapa.

20 testes passam, incluindo cobertura sem aumento de área dos telhados de quatro águas, seleção de fachada voltada à rua, chuva noturna, códigos WMO, cobertura e vento limitados e modos de demonstração. Build de produção validado. Revisão visual no navegador em desktop e em viewport de 390 × 844 via iframe local, incluindo painel de ajustes, pesquisa de pontos esportivos, chuva noturna e pausa. A página temporária de teste não é publicada. No navegador local, a praça com 146 objetos visíveis redesenhou em aproximadamente 7 ms nesta máquina; o laço animado ficou em 45–46 quadros por 2 segundos, e o modo pausado registrou zero quadros contínuos. São medições locais, não garantia de desempenho em todos os dispositivos.


## Continuação: Pixel Singapore

[How Pixel Singapore Was Made, Yadong Xie](https://www.yadongxie.com/blog/how-pixel-singapore-was-made), consultado em 7/11/2026. O artigo separa a arte estática das animações, usa uma câmera ortográfica consistente, limita detalhe pelo zoom e faz uma camada de primeiro plano ocultar veículos atrás de construções e árvores. Também descreve uma produção de arte generativa em grandes blocos com sobreposição; essa parte não foi executada neste projeto.

Aplicado nesta revisão: a máscara de veículos agora inclui a transparência exata dos sprites das copas e troncos visíveis; suavização de árvores em zoom distante e pixels nítidos de perto; nuvens/pássaros param de exigir animação no enquadramento distante, e a chuva permanece visível. Renderização da base continua sob demanda. Não há reprodução do pipeline de Qwen, de tiles fotogramétricos do Google ou de geração em GPU do artigo.
