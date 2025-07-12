# 🏁 Server Gateway v3.0 - LogLineOS

Este módulo é o supervisor soberano do LogLineOS. Ele utiliza primitivas do próprio sistema para garantir execução contínua, em vez de depender de ferramentas externas. O sistema é um organismo que se auto-regula.

## Componentes

- **`watchdog.logline`**: Utiliza a syscall `system.pid_status` para monitorar a saúde do processo do SO e a syscall `timeline.query` para encontrar e recuperar processos de negócio ("Assuntos") travados.
- **`recovery_plan.logline`**: Aciona a syscall soberana `system.service_restart` para uma recuperação limpa e auditável.
- **`systemd/loglineos.service`**: O contrato social com o sistema operacional hospedeiro, garantindo que o LogLineOS seja tratado como um serviço de primeira classe.