from pydantic import BaseModel


class PrescriptionValuesInput(BaseModel):
    right_sph: str | None = None
    right_cyl: str | None = None
    right_axis: str | None = None
    right_add: str | None = None
    left_sph: str | None = None
    left_cyl: str | None = None
    left_axis: str | None = None
    left_add: str | None = None
    pd: str | None = None


class PrescriptionManualInput(PrescriptionValuesInput):
    pass
