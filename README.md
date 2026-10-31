# Onde Está o Meu Café?

Jogo de arcada para telemóvel: um lutador numa nuvem voa do jardim de infância ao mestrado, sempre
à procura de café. Cafés e chocolate ajudam, cervejas e francesinha pesam, e pelo caminho aparecem
os professores de cada etapa e os mini-chefes da vida adulta (impostos, acidente de carro, crédito à
habitação, caos nas viagens).

**Jogar:** <https://hasp7.github.io/meu-cafe/>

Feito com IA generativa (Claude Code) a partir do prompt em [`docs/prompt.md`](docs/prompt.md) —
serve também de demonstração para os cursos GenAI.

## Como se joga

- **Arrastar o dedo** em qualquer ponto do ecrã move o herói (o movimento é relativo, o dedo não tapa
  a personagem).
- O tiro é automático.
- **Botão ⚡** (canto inferior direito): segurar carrega a onda de energia, largar dispara. Atravessa
  inimigos e apaga as balas na sua coluna; tem tempo de recarga.
- No computador: setas ou WASD para mover, espaço para a onda, P para pausa, M para o som.

### Itens

| | Item | Efeito |
|---|---|---|
| ⚪ verde | Expresso | Rápido e forte, 5 s |
| ⚪ verde | Americano | Mais suave, 12 s |
| ⚪ verde | Chocolate | Mais velocidade; a partir do Secundário vem com quebra de açúcar |
| ◆ vermelho | Cerveja, caneca, garrafa | Abrandam (a garrafa também faz abanar); a partir do Secundário dão um escudo curto |
| ◆ vermelho | Francesinha | Abranda muito; a partir do Secundário passa a "modo tanque" (aguenta um toque) |
| ⬡ dourado | Portátil, antena, seringa, estetoscópio | Drone ajudante, tiro triplo, tiro perfurante, +1 vida |

### Níveis

1. Jardim de Infância · 2. 1.º Ciclo · 3. 2.º e 3.º Ciclos · **Especial: Dia de Jogo** ·
4. Secundário · 5. Licenciatura · 6. Mestrado (chefe final: o júri, com escudo de "revisão pedida"
que só a onda de energia parte).

Cada nível sorteia um céu — limpo, nublado, chuva, nevoeiro, nascer do sol ou noite — e cada um muda
um pouco o jogo.

## Personalizar o herói

Tudo o que define a aparência está em [`js/character.js`](js/character.js): cor da pele, cabelo
(`spiky`, `short`, `bald`), barba, óculos, cores do fato, nuvem, aura, emblema e a frase-assinatura.
Muda os valores e recarrega a página.

## Modos para apresentações

- `?demo=1` — o jogo joga sozinho (sem perder vidas) e recomeça no fim.
- `?nivel=N` — começa no nível N (1 a 7, pela ordem acima, contando o Dia de Jogo como 4).

## Técnica e privacidade

- HTML, CSS e JavaScript simples num `<canvas>`, sem dependências nem passo de build.
- Sem pedidos de rede: a política de segurança (CSP) da página bloqueia-os. Funciona offline depois
  de carregado.
- Só guarda no próprio dispositivo (`localStorage`) o recorde e a preferência de som. Não há recolha
  de dados.
- Sem flashes nem efeitos estroboscópicos; respeita a preferência de "reduzir movimento" do sistema.

## Créditos

- Desenhos, personagens e níveis originais, feitos em código.
- O emblema ao peito é o logótipo da HC Healthcare & Innovation, usado pelo autor. O emblema do Dia
  de Jogo é um desenho original (riscas azuis e brancas com um dragão) e não é o emblema de nenhum
  clube.
- Os professores são figuras-tipo, não pessoas reais.

© Hélder Palheira. Todos os direitos reservados.
