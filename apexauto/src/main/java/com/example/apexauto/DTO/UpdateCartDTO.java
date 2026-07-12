package com.example.apexauto.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// DTO used when updating editable cart fields.
@Getter
@Setter
@NoArgsConstructor
public class UpdateCartDTO {

    private Integer cartStatusId;
}