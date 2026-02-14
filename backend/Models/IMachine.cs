namespace MachineSimulator.Backend.Models;

public interface IMachine
{
    string Name { get; }
    void Tick();
    object GetState();
}
