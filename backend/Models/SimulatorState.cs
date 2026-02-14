namespace MachineSimulator.Backend.Models;

public record SimulatorState(
    bool IsRunning,
    List<MachineState> Machines
);

public record MachineState(
    string Name,
    object Details
);
