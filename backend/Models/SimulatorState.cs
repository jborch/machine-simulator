namespace MachineSimulator.Backend.Models;

public record SimulatorState(
    bool IsRunning,
    List<StationState> Stations
);
