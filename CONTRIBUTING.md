# Guia de Contribuição - Sistema de Reserva

Agradecemos o seu interesse em contribuir para o nosso projeto! Este documento estabelece um conjunto de diretrizes para garantir um processo de contribuição claro e consistente.

## Como Contribuir

### Reportando Bugs
- Utilize o template de **Bug Report** para criar uma nova issue.
- Descreva o problema detalhadamente, incluindo passos para reproduzi-lo.

### Sugerindo Melhorias
- Utilize o template de **Feature Request** para criar uma nova issue.
- Descreva a funcionalidade sugerida e por que ela seria útil para o projeto.

## Processo de Desenvolvimento

1.  **Crie uma branch:** A partir da `main`, crie uma branch seguindo o padrão: `feature/nome-da-funcionalidade` ou `fix/nome-da-correcao`.
2.  **Desenvolva e comite:** Faça suas alterações e crie commits atômicos com mensagens claras (ex: "feat: adiciona endpoint de login").
3.  **Garanta a qualidade:** Antes de submeter, certifique-se de que o código está passando nas verificações de Lint, Build e Testes.
4.  **Abra um Pull Request (PR):**
    - Utilize o template de Pull Request.
    - Vincule o PR à issue correspondente.
    - Aguarde a revisão do `CODEOWNER` designado. O PR precisa de pelo menos uma aprovação para ser mergeado.
    - A pipeline de CI precisa estar verde (passando em todos os checks).
5.  **Merge:** Após a aprovação, o PR será mergeado na `main` usando a estratégia de *Squash and Merge* para manter o histórico linear.