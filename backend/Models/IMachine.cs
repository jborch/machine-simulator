namespace MachineSimulator.Backend.Models;

public interface IMachine
{
    string Name { get; }
    void Initialize() { }
    void Reset() { }
    void Tick();
    object GetState();
}
