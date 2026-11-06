# Revisão com panorâmicas do autor

Referências fornecidas por Mateus Macedo, observadas no Google Maps em 6 de novembro de 2026:

- Praça Maria Dias, panorama `CIABIhBVz0X5LAja-lZmmJib2118`, abril de 2026, posição indicada no link -20.1821272, -49.3522286.
- Orindiuva 18/04/2026, panorama `CIABIhBHqt7l3hh02vcpEjow2ERS`, abril de 2026, posição indicada -20.1834169, -49.3511536.

A vista da praça mostra cobertura branca em cruz, torre central com relógio, pináculo escuro e aberturas em arco. A fachada é clara; o antigo desenho amarelo era inadequado. O adro frontal tem piso claro, com vegetação nas laterais. A vista complementar confirma a posição da igreja no setor sudeste da praça e a entrada voltada para o espaço aberto a noroeste.

A atualização usa uma maquete arquitetônica própria sobre a posição original da detecção Microsoft. Dimensões dos volumes, alturas, bancos, canteiros e árvores são interpretações, sem medição fotogramétrica. O contorno original não é substituído; os volumes visuais adicionais ficam em `building.visual`. As casas mantêm seus contornos e posições da base aberta. Árvores decorativas que invadiam pisos, telhados e vias foram revistas. Os arquivos fotográficos não são incluídos na distribuição.

O trânsito usa uma simulação própria em segmentos dirigidos de OSM. Carros se conectam nos nós compartilhados, circulam à direita, não entram em vias privadas, caminhos ou trechos explicitamente não pavimentados. Não há dados de trânsito real, modelagem de semáforos ou garantia de fluxo sem colisões. Há controles para desativar o efeito. O mapa estático não é redesenhado a cada quadro do trânsito.

## Correção pela captura aérea de 19:48:45

A captura fornecida em seguida mostrou que a primeira interpretação tinha braços mal proporcionados, torre pintada por cima da cobertura e árvores distribuídas em uma grade artificial. A revisão compara quatro cantos da praça com o polígono OSM existente para estimar o deslocamento do conjunto. Não é uma ortorretificação: a imagem, as escolhas dos pontos e os efeitos de altura continuam sujeitos a erro. Os pontos de referência e o deslocamento ficam registrados em `visual-details.json`.

A cobertura passou a usar a união geométrica de duas coberturas de quatro águas. As superfícies de interseção são recortadas antes do desenho, sem blocos de telhado sobrepostos. Torre, paredes e cobertura compartilham a ordem de profundidade. O modelo visual foi ampliado transversalmente, reposicionado e reduzido em altura da torre. O contorno visual aproximado é usado em planta e no minimapa, enquanto a detecção original Microsoft fica preservada no registro da edificação.

A praça recebeu o agrupamento de árvores maiores de um lado, copas podadas na borda oposta, a árvore isolada no adro e patches de piso em tons diferentes. Os canteiros circulares idênticos e a repetição de postes foram retirados. A distribuição é uma interpretação da referência, sem afirmar coordenadas exatas de cada árvore.

## Alinhamento das construções

Referência adicional: panorama do autor `CIABIhB3Ga3kscNQA7WSywv0Hphj`, abril de 2026, aberto no enquadramento -20.1834169, -49.3511536, rumo 342°, inclinação 48,36°. A observação confirma predominância de casas térreas, coberturas cerâmicas e fachadas orientadas pelas ruas, com exceções em esquinas e áreas de formato irregular.

A revisão não extrai um cadastro de lotes da foto. O gerador faz ajustes rígidos e limitados em 748 contornos de exibição, com consenso de direção da rede viária, conservação de área e sem aumentar conflitos com ruas e vizinhos. São inferências visuais aplicadas por critérios locais, não validação individual das 748 casas pelo autor. A geometria original continua preservada e pode ser comparada pelo parâmetro `geometry=source`. Nos demais casos o gerador mantém o desenho de origem.
