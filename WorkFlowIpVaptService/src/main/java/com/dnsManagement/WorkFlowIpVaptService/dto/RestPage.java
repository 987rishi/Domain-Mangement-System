package com.dnsManagement.WorkFlowIpVaptService.dto; // Use your appropriate package

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.List;

/**
 * A custom Page implementation to help Jackson deserialize paginated responses
 * from Feign clients.
 * @param <T>
 */
public class RestPage<T> extends PageImpl<T> {

  @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
  public RestPage(@JsonProperty("content") List<T> content,
                  @JsonProperty("number") int number,
                  @JsonProperty("size") int size,
                  @JsonProperty("totalElements") Long totalElements,
                  @JsonProperty("pageable") JsonNode pageable, // We can ignore these complex objects
                  @JsonProperty("last") boolean last,
                  @JsonProperty("totalPages") int totalPages,
                  @JsonProperty("sort") JsonNode sort,
                  @JsonProperty("first") boolean first,
                  @JsonProperty("numberOfElements") int numberOfElements) {

    super(content, PageRequest.of(number, size), totalElements);
  }

  // You can add other constructors if needed
  public RestPage(List<T> content, Pageable pageable, long total) {
    super(content, pageable, total);
  }

  public RestPage(List<T> content) {
    super(content);
  }
}