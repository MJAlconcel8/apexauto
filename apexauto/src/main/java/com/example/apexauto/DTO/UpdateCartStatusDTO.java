package com.example.apexauto.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// DTO used to update an existing cart status.
@Getter
@Setter
@NoArgsConstructor
public class UpdateCartStatusDTO {

    private String cartStatusName;
}