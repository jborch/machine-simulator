namespace MachineSimulator.Backend.Models;

public record ConveyorState(
    Dictionary<int, MoverState> Slots
);
