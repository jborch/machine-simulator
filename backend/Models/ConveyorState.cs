namespace MachineSimulator.Backend.Models;

public record ConveyorState(
    MoverState?[] Slots
);
