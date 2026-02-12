namespace MachineSimulator.Backend.Models;

public interface ICarrier
{
    string Id { get; }
    IItem? CurrentItem { get; }
    void Load(IItem item);
    void Unload();
}
