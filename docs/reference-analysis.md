# Referências visuais e análise com REA

Consulta em 6 de novembro de 2026.

## TinyRJ

Fonte: https://tinyrj.com/embed.html#10146,-14134,0.1368

Dois scripts inline públicos, totalizando 172.000 bytes, foram extraídos como texto e analisados com `npx -y rea-agents@6.8.0 analyze-javascript-application /tmp/tinyrj-rea-source --json`. O REA analisou ambos sem falhas de sintaxe. O identificador da evidência, o hash do artefato e os limites estão em `tinyrj-rea-summary.json`. O runtime Node local 24.18 emitiu aviso de versão inferior à faixa recomendada pelo pacote; o comando concluiu com código zero e evidência validada.

A leitura manual do código inventariado pelo REA mostrou:

- Imagens WebP prontas, em três resoluções (256, 512 e 1024 pixels), selecionadas pelo tamanho do bloco na tela.
- Cache com liberação de bitmaps antigos e decodificação assíncrona por `createImageBitmap`.
- Pedido de quadro somente enquanto há movimento, transição ou mudança.
- Interface clara com controles arredondados, acento em terracota e minimapa.

Essas observações são do cliente público. O REA não recuperou o servidor, a rotina de criação da arte nem transformou a cidade em um modelo editável. A arte dos blocos e o código do TinyRJ não foram incorporados ao projeto.

## Isometric Vancouver

Fonte: https://vancouver.isoworld.xyz/

Inspeção visual no navegador e leitura do painel “How it’s made”: o site descreve desenhos por IA feitos em blocos, orientados por uma câmera isométrica e dados estruturais. O acabamento visto é uma ilustração pronta, não apenas extrusão de polígonos em tempo real. Vegetação em camadas, variação tonal, sombras e volumes orientaram a atualização da arte procedural de Orindiúva. A análise com REA acima se restringiu ao TinyRJ.

## Aplicação em Orindiúva

Implementação própria: atualização sob demanda, chuva limitada a 24 Hz, pausa em aba oculta, seleção espacial de objetos, caminhos projetados em cache, texturas de telhas reutilizadas, copas com volumes e telhados divididos sobre os contornos existentes. Controles com bordas mais finas e superfícies claras.

A meta é aproximar o acabamento das referências, preservando o mapa verificável de Orindiúva. O resultado ainda usa arte procedural; não equivale à ilustração por IA em blocos das referências nem à reprodução exata de cada fachada.

## Medição local

Antes: registros de 239–241 atualizações de efeitos em dois segundos, mesmo parado. Após: intervalos estáveis com zero quadros e zero atualizações de efeitos; redesenhos continuam ocorrendo quando a cena muda, inclusive por relógio ou clima. Em uma navegação a escala 0,64, o desenho levou 16,4 ms para 3.669 objetos visíveis. Valores da sessão local, sem garantia de FPS ou de aceleração em outros dispositivos.
