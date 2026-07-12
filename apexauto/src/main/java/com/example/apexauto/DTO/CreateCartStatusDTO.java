package com.example.apexauto.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// DTO used to create a reusable cart status.
@Getter
@Setter
@NoArgsConstructor
public class CreateCartStatusDTO {

    private String cartStatusName;
}